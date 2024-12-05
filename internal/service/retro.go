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
}

type retroService struct {
	repo repository.RetroRepository
}

func NewRetroService(repo repository.RetroRepository) RetroService {
	return &retroService{
		repo: repo,
	}
}

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
