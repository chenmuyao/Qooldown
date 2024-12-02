package main

import (
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
) *gin.Engine {
	server := gin.Default()
	server.Use(middlewares...)
	userHandlers.RegisterRoutes(server)
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
		"/users/signup",
		"/users/login",
	})
	return loginJWT.CheckLogin()
}

func InitDB() *gorm.DB {
	db, err := gorm.Open(
		mysql.Open(config.Config.DB.DSN),
		&gorm.Config{},
	)
	if err != nil {
		panic("failed to connect database")
	}

	err = repository.InitTable(db)
	if err != nil {
		panic("failed to init tables")
	}
	return db
}
