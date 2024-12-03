package main

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/chenmuyao/qooldown/config"
	"github.com/chenmuyao/qooldown/internal/handler"
	"github.com/chenmuyao/qooldown/internal/middleware"
	"github.com/chenmuyao/qooldown/internal/repository"
	"github.com/chenmuyao/qooldown/internal/service"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	db := InitDB()

	server := InitWebServer(
		InitGinMiddlewares(),
		handler.NewUserHandler(service.NewUserService(repository.NewUserRepository(db))),
		handler.NewWebSocketHandler(),
		handler.NewRetroHandler(service.NewRetroService(repository.NewRetroRepository(db))),
	)

	server.GET(
		"/",
		func(ctx *gin.Context) { ctx.String(http.StatusOK, "Trop de bugs. -- Aurore Philip") },
	)

	server.Run(":8881")
}

func InitWebServer(
	middlewares []gin.HandlerFunc,
	userHandlers *handler.UserHandler,
	wsHandler *handler.WebSocketHandler,
	retroHandlers *handler.RetroHandler,
) *gin.Engine {
	server := gin.Default()
	server.Use(middlewares...)
	userHandlers.RegisterRoutes(server)
	wsHandler.RegisterRoutes(server)
	retroHandlers.RegisterRoutes(server)
	return server
}

func InitGinMiddlewares() []gin.HandlerFunc {
	return []gin.HandlerFunc{
		cors.New(cors.Config{
			AllowCredentials: true,
			AllowHeaders:     []string{"Content-Type", "Authorization"},
			AllowAllOrigins:  true, // XXX: hack
			MaxAge:           12 * time.Hour,
		}),

		useJWT(),
	}
}

func useJWT() gin.HandlerFunc {
	loginJWT := middleware.NewLoginJWT([]string{
		"/",
		"/ws",
		"/users/signup",
		"/users/login",
	})
	return loginJWT.CheckLogin()
}

func InitDB() *gorm.DB {
	var db *gorm.DB
	var err error

	retryTimes := 3
	for range retryTimes {
		db, err = gorm.Open(
			mysql.Open(config.Config.DB.DSN),
			&gorm.Config{},
		)
		if err != nil {
			time.Sleep(3 * time.Second)
			slog.Error("failed to connect to database", "err", err)
		}
	}

	if err != nil {
		panic("failed to connect to database")
	}

	err = repository.InitTable(db)
	if err != nil {
		panic("failed to init tables")
	}
	return db
}
