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
	UserID int64 `json:"owner_id"`
	User   User  `json:"owner"`

	// has many
	Questions []TemplateQuestion `json:"questions"`
}

type TemplateQuestion struct {
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	ID        int64          `json:"id"         gorm:"primarykey;autoIncrement"`

	Content string `json:"content"`

	// fk
	TemplateID int64 `json:"template_id"`
}

type Question struct {
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	ID        int64          `json:"id"         gorm:"primarykey;autoIncrement"`

	Content string `json:"content"`
	PosX    int64  `json:"pos_x"`
	LenX    int64  `json:"len_x"`

	// fk
	RetroID int64 `json:"retro_id"`

	// has many
	Postits []Postit `json:"postits"`
}

type Retro struct {
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	ID        int64          `json:"id"         gorm:"primarykey;autoIncrement"`

	Name string `gorm:"index" json:"name"`

	// many to many
	Users []User `gorm:"many2many:retro_users;"`

	// Questions are copied from the template
	// has many
	Questions []Question `json:"questions"`
}

type Postit struct {
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	ID        int64          `json:"id"         gorm:"primarykey;autoIncrement"`

	// belongs to
	UserID int64 `json:"owner_id"`
	User   User  `json:"owner"`

	// belongs to
	QuestionID int64 `json:"question_id"`

	Votes int `json:"votes"`

	// Content
	Content string `json:"content"`

	// Posision
	PosX int64 `json:"pos_x"`
	PosY int64 `json:"pos_y"`
	LenX int64 `json:"len_x"`
	LenY int64 `json:"len_y"`
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
