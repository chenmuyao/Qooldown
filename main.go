package main

import (
	"net/http"

	"github.com/chenmuyao/qooldown/config"
	"github.com/chenmuyao/qooldown/internal/repository"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	server := gin.Default()

	_ = InitDB()

	server.GET(
		"/",
		func(ctx *gin.Context) { ctx.String(http.StatusOK, "Trop de bug -- Aurore Philip") },
	)

	server.Run(":8881")
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
