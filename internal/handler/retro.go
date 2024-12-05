package handler

import (
	"log/slog"
	"net/http"
	"strconv"

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
	templates.GET("/", h.GetTemplates)
	templates.GET("/:id", h.GetTemplateByID)
	templates.DELETE("/:id", h.DeleteTemplateByID)
	// templates.POST("/:id", h.EditTemplateByID)

	retros := server.Group("/retros")
	retros.POST("/", h.CreateRetro)
	retros.GET("/", h.GetAllRetros)
}

// {{{ Templates

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

	var questions []repository.TemplateQuestion

	for _, content := range req.Questions {
		question := repository.TemplateQuestion{
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

func (h *RetroHandler) GetTemplates(ctx *gin.Context) {
	// TODO: Pagination not handled
	t, err := h.svc.GetTemplates(ctx)
	if err != nil {
		slog.Error("get template", "err", err)
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}
	ctx.JSON(http.StatusOK, Result{
		Code: CodeOK,
		Msg:  "create template success",
		Data: t,
	})
}

func (h *RetroHandler) DeleteTemplateByID(ctx *gin.Context) {
	idStr := ctx.Param("id")

	tid, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("wrong template id", "id", tid, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "wrong template id",
		})
		return
	}

	uid, ok := ctx.Get("uid")
	if !ok {
		slog.Error("cannot get user id")
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}

	err = h.svc.DeleteTemplateByID(ctx, int64(tid), uid.(int64))
	switch err {
	case service.ErrNoAccess:
		slog.Error("no access", "err", err)
		ctx.JSON(http.StatusForbidden, Result{
			Code: CodeUserSide,
			Msg:  err.Error(),
		})
		return
	case service.ErrIDNotFound:
		slog.Error("template id not found", "id", tid, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "id not found",
		})
		return
	case nil:
		ctx.JSON(http.StatusOK, Result{
			Code: CodeOK,
			Msg:  "delete template success",
		})
		return
	default:
		slog.Error("delete template", "err", err)
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}
}

func (h *RetroHandler) GetTemplateByID(ctx *gin.Context) {
	idStr := ctx.Param("id")

	tid, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("wrong template id", "id", tid, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "wrong template id",
		})
		return
	}

	uid, ok := ctx.Get("uid")
	if !ok {
		slog.Error("cannot get user id")
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}

	t, err := h.svc.GetTemplateByID(ctx, int64(tid), uid.(int64))
	switch err {
	case nil:
		ctx.JSON(http.StatusOK, Result{
			Code: CodeOK,
			Msg:  "get template success",
			Data: t,
		})
	case service.ErrNoAccess:
		slog.Error("no access", "err", err)
		ctx.JSON(http.StatusForbidden, Result{
			Code: CodeUserSide,
			Msg:  err.Error(),
		})
		return
	case service.ErrIDNotFound:
		slog.Error("template id not found", "id", tid, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "id not found",
		})
		return
	default:
		slog.Error("get template", "err", err)
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}
}

// }}}

func (h *RetroHandler) CreateRetro(ctx *gin.Context) {
}

func (h *RetroHandler) GetAllRetros(ctx *gin.Context) {
}

// GetRetroByID returns everything relative to a retro
func (h *RetroHandler) GetRetroByID(ctx *gin.Context) {
}

func (h *RetroHandler) DeleteRetroByID(ctx *gin.Context) {
}

func (h *RetroHandler) CreatePost(ctx *gin.Context) {
}

func (h *RetroHandler) UpdatePost(ctx *gin.Context) {
}

func (h *RetroHandler) DeletePost(ctx *gin.Context) {
}

// TODO: Nice to have ...

func (h *RetroHandler) VotePostByID(ctx *gin.Context) {
}

func (h *RetroHandler) GetTopVotePosts(ctx *gin.Context) {
	// Top N
}

func (h *RetroHandler) AddPostResolution(ctx *gin.Context) {
}

func (h *RetroHandler) ChangePostResolution(ctx *gin.Context) {
}

func (h *RetroHandler) DeletePostResolution(ctx *gin.Context) {
}
