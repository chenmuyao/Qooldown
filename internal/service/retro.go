package service

import (
	"context"
	"errors"

	"github.com/chenmuyao/qooldown/internal/repository"
)

var (
	ErrNoAccess          = errors.New("not the owner of this object")
	ErrIDNotFound        = repository.ErrIDNotFound
	NoContentPlaceholder = "~~~~~~~~\n~~~~~~~~"
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
	GetTopVotePostits(ctx context.Context, rid int64, n int) ([]repository.Postit, error)

	CreatePostit(ctx context.Context, postit PostitCreate, uid int64) (repository.Postit, error)
	DeletePostitByID(ctx context.Context, pid int64, uid int64) error
	UpdatePostit(
		ctx context.Context,
		pid int64,
		postit PostitUpdate,
		uid int64,
	) (repository.Postit, error)
	VotePostitByID(ctx context.Context, pid int64) error
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
	return r.repo.CreateRetro(ctx, tid, uid, name)
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
	retro, err := r.repo.GetRetroByID(ctx, tid)
	if err != nil {
		return repository.Retro{}, err
	}

	for i := range retro.Questions {
		for j := range retro.Questions[i].Postits {
			// the post is not visible and it does not belong to the user
			if !retro.Questions[i].Postits[j].IsVisible &&
				retro.Questions[i].Postits[j].UserID != uid {
				retro.Questions[i].Postits[j].Content = NoContentPlaceholder
			}
		}
	}
	return retro, nil
}

func (r *retroService) GetTopVotePostits(
	ctx context.Context,
	rid int64,
	n int,
) ([]repository.Postit, error) {
	return r.repo.GetTopVotePostits(ctx, rid, n)
}

// }}}
// {{{ Postit

type PostitCreate struct {
	QuestionID int64  `json:"question_id" binding:"required"`
	Content    string `json:"content"`
	IsVisible  bool   `json:"is_visible"`
}

type PostitUpdate struct {
	Content   string `json:"content"`
	IsVisible bool   `json:"is_visible"`
}

func (r *retroService) CreatePostit(
	ctx context.Context,
	postit PostitCreate,
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

func (r *retroService) UpdatePostit(
	ctx context.Context,
	pid int64,
	postit PostitUpdate,
	uid int64,
) (repository.Postit, error) {
	p, err := r.repo.GetPostitByID(ctx, pid)
	if err != nil {
		return repository.Postit{}, err
	}
	// compare the owner
	if p.UserID != uid {
		return repository.Postit{}, ErrNoAccess
	}

	p.Content = postit.Content
	p.IsVisible = postit.IsVisible

	return r.repo.UpdatePostit(ctx, p)
}

func (r *retroService) DeletePostitByID(ctx context.Context, pid int64, uid int64) error {
	p, err := r.repo.GetPostitByID(ctx, pid)
	if err != nil {
		return err
	}
	// compare the owner
	if p.UserID != uid {
		return ErrNoAccess
	}

	return r.repo.DeletePostitByID(ctx, pid)
}

func (r *retroService) VotePostitByID(ctx context.Context, pid int64) error {
	return r.repo.VotePostitByID(ctx, pid)
}

// }}}
