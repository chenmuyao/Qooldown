package service

import (
	"context"
	"errors"

	"github.com/chenmuyao/qooldown/internal/repository"
)

var (
	ErrNoAccess   = errors.New("not the owner of this object")
	ErrIDNotFound = repository.ErrIDNotFound
)

type RetroService interface {
	CreateTemplate(ctx context.Context, template repository.Template) (repository.Template, error)
	GetTemplates(ctx context.Context) ([]repository.Template, error)
	DeleteTemplateByID(ctx context.Context, tid int64, uid int64) error
	GetTemplateByID(ctx context.Context, tid int64, uid int64) (repository.Template, error)

	CreateRetro(ctx context.Context, tid int64, uid int64, name string) (repository.Retro, error)
	GetRetros(ctx context.Context) ([]repository.Retro, error)
	GetRetroByID(ctx context.Context, tid int64, uid int64) (repository.Retro, error)
	DeleteRetroByID(ctx context.Context, tid int64, uid int64) error

	CreatePostit(ctx context.Context, postit Postit, uid int64) (repository.Postit, error)
}

type retroService struct {
	repo repository.RetroRepository
}

func NewRetroService(repo repository.RetroRepository) RetroService {
	return &retroService{
		repo: repo,
	}
}

// {{{ Template

func (r *retroService) CreateTemplate(
	ctx context.Context,
	template repository.Template,
) (repository.Template, error) {
	return r.repo.InsertTemplate(ctx, template)
}

func (r *retroService) GetTemplates(ctx context.Context) ([]repository.Template, error) {
	return r.repo.GetTemplates(ctx)
}

func (r *retroService) DeleteTemplateByID(ctx context.Context, tid int64, uid int64) error {
	// Get the template by ID
	t, err := r.repo.GetTemplateByID(ctx, tid)
	if err != nil {
		return err
	}
	// compare the owner
	if t.UserID != uid {
		return ErrNoAccess
	}

	return r.repo.DeleteTemplateByID(ctx, tid)
}

func (r *retroService) GetTemplateByID(
	ctx context.Context,
	tid int64,
	uid int64,
) (repository.Template, error) {
	// Get the template by ID
	t, err := r.repo.GetTemplateByID(ctx, tid)
	if err != nil {
		return repository.Template{}, err
	}
	// compare the owner
	if t.UserID != uid {
		return repository.Template{}, ErrNoAccess
	}

	return t, nil
}

// }}}
// {{{ Retro

func (r *retroService) CreateRetro(
	ctx context.Context,
	tid int64,
	uid int64,
	name string,
) (repository.Retro, error) {
	return r.repo.CreateRetro(ctx, uid, tid, name)
}

func (r *retroService) GetRetros(ctx context.Context) ([]repository.Retro, error) {
	return r.repo.GetRetros(ctx)
}

func (r *retroService) DeleteRetroByID(ctx context.Context, tid int64, uid int64) error {
	// Get the retro by ID
	t, err := r.repo.GetRetroByID(ctx, tid)
	if err != nil {
		return err
	}
	// compare the owner
	if t.UserID != uid {
		return ErrNoAccess
	}

	return r.repo.DeleteRetroByID(ctx, tid)
}

func (r *retroService) GetRetroByID(
	ctx context.Context,
	tid int64,
	uid int64,
) (repository.Retro, error) {
	// Get the retro by ID
	t, err := r.repo.GetRetroByID(ctx, tid)
	if err != nil {
		return repository.Retro{}, err
	}
	return t, nil
}

// }}}
// {{{ Postit

type Postit struct {
	QuestionID int64  `json:"question_id" binding:"required"`
	Content    string `json:"content"`
	IsVisible  bool   `json:"is_visible"`
}

func (r *retroService) CreatePostit(
	ctx context.Context,
	postit Postit,
	uid int64,
) (repository.Postit, error) {
	model := repository.Postit{
		UserID:     uid,
		QuestionID: postit.QuestionID,
		Content:    postit.Content,
		IsVisible:  postit.IsVisible,
	}
	return r.repo.CreatePostit(ctx, model)
}

// }}}
