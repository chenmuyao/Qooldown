package handler

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/chenmuyao/qooldown/internal/repository"
	"github.com/chenmuyao/qooldown/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var JWTKey = []byte("xQUPmbb2TP9CUyFZkgOnV3JQdr22ZNBx")

type UserHandler struct {
	svc service.UserService
}

type UserClaims struct {
	jwt.RegisteredClaims
	UID int64
}

func NewUserHandler(svc service.UserService) *UserHandler {
	return &UserHandler{
		svc: svc,
	}
}

func (h *UserHandler) RegisterRoutes(server *gin.Engine) {
	user := server.Group("/users/")
	user.POST("/signup", h.SignUp)
	user.POST("/login", h.LoginJWT)
}

type loginData struct {
	Token    string `json:"token"`
	Username string `json:"username"`
	ID       int64  `json:"id"`
}

func (h *UserHandler) SignUp(ctx *gin.Context) {
	type SignUpReq struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	var req SignUpReq

	if err := ctx.Bind(&req); err != nil {
		slog.Error("bad request", "err", err)
		return
	}

	// XXX: no input checks

	u, err := h.svc.SignUp(ctx, repository.User{
		Username: req.Username,
		Password: req.Password,
	})
	switch err {
	case nil:
		token, err := h.getJWTToken(int64(u.ID))
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		}
		ctx.JSON(http.StatusOK, Result{
			Code: CodeOK,
			Msg:  "signup success",
			Data: loginData{
				Token:    token,
				Username: u.Username,
				ID:       u.ID,
			},
		})
	case service.ErrDuplicatedUser:
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "user exists",
		})
	default:
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
	}
}

func (h *UserHandler) LoginJWT(ctx *gin.Context) {
	type Req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	var req Req

	if err := ctx.Bind(&req); err != nil {
		return
	}

	// NOTE: No need to check, because if it's not valid, we won't get
	// anything from the DB anyway.

	u, err := h.svc.Login(ctx, req.Username, req.Password)
	switch err {
	case nil:
		token, err := h.getJWTToken(int64(u.ID))
		if err != nil {
			return // error message is set
		}
		ctx.JSON(http.StatusOK, Result{
			Code: CodeOK,
			Msg:  "successful login",
			Data: loginData{
				Token: token,
			},
		})
	case service.ErrInvalidUserOrPassword:
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "wrong login or password",
		})
	default:
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
	}
}

func (h *UserHandler) getJWTToken(uid int64) (string, error) {
	uc := UserClaims{
		UID: uid,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 30)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, uc)
	tokenStr, err := token.SignedString(JWTKey)
	if err != nil {
		slog.Error("token string generate error", "err", err)
		return "", err
	}

	return tokenStr, nil
}
