package handler

import (
	"log/slog"
	"net/http"

	"github.com/chenmuyao/qooldown/internal/repository"
	"github.com/chenmuyao/qooldown/internal/service"
	"github.com/gin-gonic/gin"
)

type RetroHandler struct {
	svc service.RetroService
}

func NewRetroHandler(svc service.RetroService) *RetroHandler {
	return &RetroHandler{
		svc: svc,
	}
}

func (h *RetroHandler) RegisterRoutes(server *gin.Engine) {
	templates := server.Group("/templates")
	templates.POST("/", h.CreateTemplate)
	// templates.GET("/:id", h.GetTemplateByID)
	// templates.GET("/", h.GetTemplates)

	// user := server.Group("/retros/")
	// user.POST("/login", h.LoginJWT)
	// user.GET("/retros", h.GetRetros)
	// user.GET("/retros/:id", h.GetRetroByID)
}

func (h *RetroHandler) CreateTemplate(ctx *gin.Context) {
	type Req struct {
		Name      string   `json:"name"      binding:"required"`
		Questions []string `json:"questions" binding:"required"`
	}
	// TODO:
	// VotesPerUser      int      `json:"votes_per_user"`
	// AuthorizeSelfVote bool     `json:"authorize_self_vote"`

	var req Req

	if err := ctx.Bind(&req); err != nil {
		slog.Error("bad request", "err", err)
		return
	}

	uid, ok := ctx.Get("uid")
	if !ok {
		slog.Error("cannot get user id")
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}

	var questions []repository.Question

	for _, content := range req.Questions {
		question := repository.Question{
			Content: content,
		}
		questions = append(questions, question)
	}

	template := repository.Template{
		Name:      req.Name,
		UserID:    uid.(int64),
		Questions: questions,
	}

	t, err := h.svc.CreateTemplate(ctx, template)
	if err != nil {
		slog.Error("create template", "err", err)
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}
	ctx.JSON(http.StatusOK, Result{
		Code: CodeOK,
		Msg:  "create template success",
		Data: t, // ID, Name
	})
}
