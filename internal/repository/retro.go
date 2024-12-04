package repository

import (
	"context"
	"time"

	"gorm.io/gorm"
)

type Template struct {
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	ID        int64          `json:"id"         gorm:"primarykey;autoIncrement"`

	Name string `gorm:"index" json:"name"`

	// belongs to
	UserID int64
	User   User

	// has many
	Questions []Question `json:"questions"`
}

type Question struct {
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	ID        int64          `json:"id"         gorm:"primarykey;autoIncrement"`

	Content string `json:"content"`

	// fk
	TemplateID int64 `json:"template_id"`
}

type RetroRepository interface {
	InsertTemplate(ctx context.Context, t Template) (Template, error)
	GetTemplates(ctx context.Context) ([]Template, error)
}

type GORMRetroRepository struct {
	db *gorm.DB
}

func NewRetroRepository(db *gorm.DB) RetroRepository {
	return &GORMRetroRepository{
		db: db,
	}
}

func (repo *GORMRetroRepository) InsertTemplate(
	ctx context.Context,
	t Template,
) (Template, error) {
	err := repo.db.Create(&t).Error
	return t, err
}

func (repo *GORMRetroRepository) GetTemplates(ctx context.Context) ([]Template, error) {
	var t []Template
	err := repo.db.Find(&t).Error
	return t, err
}
