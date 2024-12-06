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
	retros.GET("/", h.GetRetros)
	retros.GET("/:id", h.GetRetroByID)
	retros.DELETE("/:id", h.DeleteRetroByID)
	retros.GET("/:id/top", h.GetTopVotePostits)

	postits := server.Group("/postits")
	postits.POST("/", h.CreatePostit)
	postits.POST("/:id", h.UpdatePostitByID)
	postits.DELETE("/:id", h.DeletePostitByID)
	postits.POST("/:id/vote", h.VotePostitByID)
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
		Msg:  "get template success",
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
	type Req struct {
		Name string `json:"name"        binding:"required"`
		TID  int64  `json:"template_id" binding:"required"`
	}

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

	r, err := h.svc.CreateRetro(ctx, req.TID, uid.(int64), req.Name)
	if err != nil {
		slog.Error("create retro", "err", err)
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}
	ctx.JSON(http.StatusOK, Result{
		Code: CodeOK,
		Msg:  "create retro success",
		Data: r, // ID, Name
	})
}

func (h *RetroHandler) GetRetros(ctx *gin.Context) {
	// TODO: Pagination not handled
	t, err := h.svc.GetRetros(ctx)
	if err != nil {
		slog.Error("get retros", "err", err)
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}
	ctx.JSON(http.StatusOK, Result{
		Code: CodeOK,
		Msg:  "get retros success",
		Data: t,
	})
}

// GetRetroByID returns everything relative to a retro
func (h *RetroHandler) GetRetroByID(ctx *gin.Context) {
	idStr := ctx.Param("id")

	rid, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("wrong retro id", "id", rid, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "wrong retro id",
		})
		return
	}

	uid, ok := ctx.Get("uid")
	if !ok {
		slog.Error("cannot get user id")
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}

	t, err := h.svc.GetRetroByID(ctx, int64(rid), uid.(int64))
	switch err {
	case nil:
		ctx.JSON(http.StatusOK, Result{
			Code: CodeOK,
			Msg:  "get retro success",
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
		slog.Error("retro id not found", "id", rid, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "id not found",
		})
		return
	default:
		slog.Error("get retro", "err", err)
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}
}

func (h *RetroHandler) DeleteRetroByID(ctx *gin.Context) {
	idStr := ctx.Param("id")

	rid, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("wrong retro id", "id", rid, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "wrong retro id",
		})
		return
	}

	uid, ok := ctx.Get("uid")
	if !ok {
		slog.Error("cannot get user id")
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}

	err = h.svc.DeleteRetroByID(ctx, int64(rid), uid.(int64))
	switch err {
	case service.ErrNoAccess:
		slog.Error("no access", "err", err)
		ctx.JSON(http.StatusForbidden, Result{
			Code: CodeUserSide,
			Msg:  err.Error(),
		})
		return
	case service.ErrIDNotFound:
		slog.Error("retro id not found", "id", rid, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "id not found",
		})
		return
	case nil:
		ctx.JSON(http.StatusOK, Result{
			Code: CodeOK,
			Msg:  "delete retro success",
		})
		return
	default:
		slog.Error("delete retro", "err", err)
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}
}

func (h *RetroHandler) GetTopVotePostits(ctx *gin.Context) {
	nStr := ctx.Query("n")
	n, err := strconv.Atoi(nStr)
	if err != nil {
		slog.Error("wrong top number", "number", n, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "wrong top n",
		})
		return
	}

	idStr := ctx.Param("id")

	rid, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("wrong retro id", "id", rid, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "wrong retro id",
		})
		return
	}

	postits, err := h.svc.GetTopVotePostits(ctx, int64(rid), n)
	switch err {
	case service.ErrIDNotFound:
		slog.Error("retro id not found", "id", rid, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "id not found",
		})
		return
	case nil:
		ctx.JSON(http.StatusOK, Result{
			Code: CodeOK,
			Msg:  "get top success",
			Data: postits,
		})
		return
	default:
		slog.Error("get ton n", "err", err)
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}
}

func (h *RetroHandler) CreatePostit(ctx *gin.Context) {
	// type Req struct {
	// 	QuestionID int64  `json:"question_id" binding:"required"`
	// 	Content    string `json:"content"`
	// 	IsVisible  bool   `json:"is_visible"`
	// }

	var req service.PostitCreate

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

	r, err := h.svc.CreatePostit(ctx, req, uid.(int64))
	if err != nil {
		slog.Error("create postit", "err", err)
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}

	ctx.JSON(http.StatusOK, Result{
		Code: CodeOK,
		Msg:  "create postit success",
		Data: r, // ID, Name
	})
}

func (h *RetroHandler) UpdatePostitByID(ctx *gin.Context) {
	// type Req struct {
	// 	Content   string `json:"content"`
	// 	IsVisible bool   `json:"is_visible"`
	// }

	idStr := ctx.Param("id")

	pid, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("wrong postit id", "id", pid, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "wrong postit id",
		})
		return
	}

	var req service.PostitUpdate

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

	_, err = h.svc.UpdatePostit(ctx, int64(pid), req, uid.(int64))
	switch err {
	case service.ErrNoAccess:
		slog.Error("no access", "err", err)
		ctx.JSON(http.StatusForbidden, Result{
			Code: CodeUserSide,
			Msg:  err.Error(),
		})
		return
	case service.ErrIDNotFound:
		slog.Error("prostit id not found", "id", pid, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "id not found",
		})
		return
	case nil:
		ctx.JSON(http.StatusOK, Result{
			Code: CodeOK,
			Msg:  "update postit success",
		})
		return
	default:
		slog.Error("update postit", "err", err)
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}
}

func (h *RetroHandler) DeletePostitByID(ctx *gin.Context) {
	idStr := ctx.Param("id")

	pid, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("wrong postit id", "id", pid, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "wrong postit id",
		})
		return
	}

	uid, ok := ctx.Get("uid")
	if !ok {
		slog.Error("cannot get user id")
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}

	err = h.svc.DeletePostitByID(ctx, int64(pid), uid.(int64))
	switch err {
	case service.ErrNoAccess:
		slog.Error("no access", "err", err)
		ctx.JSON(http.StatusForbidden, Result{
			Code: CodeUserSide,
			Msg:  err.Error(),
		})
		return
	case service.ErrIDNotFound:
		slog.Error("prostit id not found", "id", pid, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "id not found",
		})
		return
	case nil:
		ctx.JSON(http.StatusOK, Result{
			Code: CodeOK,
			Msg:  "delete postit success",
		})
		return
	default:
		slog.Error("delete postit", "err", err)
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}
}

func (h *RetroHandler) VotePostitByID(ctx *gin.Context) {
	idStr := ctx.Param("id")

	pid, err := strconv.Atoi(idStr)
	if err != nil {
		slog.Error("wrong postit id", "id", pid, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "wrong postit id",
		})
		return
	}

	err = h.svc.VotePostitByID(ctx, int64(pid))
	switch err {
	case service.ErrNoAccess:
		slog.Error("no access", "err", err)
		ctx.JSON(http.StatusForbidden, Result{
			Code: CodeUserSide,
			Msg:  err.Error(),
		})
		return
	case service.ErrIDNotFound:
		slog.Error("prostit id not found", "id", pid, "err", err)
		ctx.JSON(http.StatusBadRequest, Result{
			Code: CodeUserSide,
			Msg:  "id not found",
		})
		return
	case nil:
		ctx.JSON(http.StatusOK, Result{
			Code: CodeOK,
			Msg:  "vote for postit success",
		})
		return
	default:
		slog.Error("vote for postit", "err", err)
		ctx.JSON(http.StatusInternalServerError, InternalServerErrorResult)
		return
	}
}

// TODO: Nice to have ...

func (h *RetroHandler) AddPostitResolution(ctx *gin.Context) {
}

func (h *RetroHandler) ChangePostitResolution(ctx *gin.Context) {
}

func (h *RetroHandler) DeletePostitResolution(ctx *gin.Context) {
}
