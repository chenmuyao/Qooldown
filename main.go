package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	server := gin.Default()

	server.GET(
		"/hello",
		func(ctx *gin.Context) { ctx.String(http.StatusOK, "Trop de bug -- Aurore Philip") },
	)

	server.Run(":8881")
}
