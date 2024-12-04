package service

import (
	"context"

	"github.com/chenmuyao/qooldown/internal/repository"
)

type RetroService interface {
	CreateTemplate(ctx context.Context, template repository.Template) (repository.Template, error)
	GetTemplates(ctx context.Context) ([]repository.Template, error)
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
