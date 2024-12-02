package middleware

import (
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/chenmuyao/qooldown/internal/handler"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type LoginJWT struct {
	ignorePaths map[string]struct{}
}

func NewLoginJWT(ignorePaths []string) *LoginJWT {
	ignorePathsMap := make(map[string]struct{}, len(ignorePaths))
	for _, path := range ignorePaths {
		ignorePathsMap[path] = struct{}{}
	}
	return &LoginJWT{
		ignorePaths: ignorePathsMap,
	}
}

func (m *LoginJWT) CheckLogin() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		path := ctx.Request.URL.Path
		if _, ok := m.ignorePaths[path]; ok {
			// Do not check
			return
		}
		// Authorization: Bearer XXXX
		authCode := ctx.GetHeader("Authorization")
		if authCode == "" {
			// not logged in
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		segs := strings.Split(authCode, " ")
		if len(segs) != 2 || segs[0] != "Bearer" {
			// authorization in wrong format
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		tokenStr := segs[1]

		var uc handler.UserClaims
		token, err := jwt.ParseWithClaims(tokenStr, &uc, func(t *jwt.Token) (interface{}, error) {
			return handler.JWTKey, nil
		})
		if err != nil {
			// token cannot be parsed
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		if !token.Valid {
			// parsed but unauthorized
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		expireTime := uc.ExpiresAt.Time
		if time.Until(expireTime) < 29*time.Hour {
			uc.ExpiresAt = jwt.NewNumericDate(time.Now().Add(30 * time.Hour))
			tokenStr, err = token.SignedString(handler.JWTKey)
			ctx.Header("x-jwt-token", tokenStr)
			if err != nil {
				log.Println(err)
			}
		}

		ctx.Set("user", uc)
	}
}
