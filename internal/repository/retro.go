package repository

import (
	"context"
	"time"

	"gorm.io/gorm"
)

var ErrIDNotFound = gorm.ErrRecordNotFound

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

	// // many to many
	// Users []User `gorm:"many2many:retro_users;"`

	// belongs to
	UserID int64 `json:"owner_id"`
	User   User  `json:"owner"`

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
	Content   string `json:"content"`
	IsVisible bool   `json:"is_visible"`
}

type RetroRepository interface {
	InsertTemplate(ctx context.Context, t Template) (Template, error)
	UpdateTemplate(ctx context.Context, t Template) (Template, error)
	GetTemplates(ctx context.Context) ([]Template, error)
	GetTemplateByID(ctx context.Context, tid int64) (Template, error)
	DeleteTemplateByID(ctx context.Context, tid int64) error

	CreateRetro(ctx context.Context, tid int64, uid int64, name string) (Retro, error)
	GetRetros(ctx context.Context) ([]Retro, error)
	GetRetroByID(ctx context.Context, rid int64) (Retro, error)
	DeleteRetroByID(ctx context.Context, rid int64) error
}

type GORMRetroRepository struct {
	db *gorm.DB
}

func NewRetroRepository(db *gorm.DB) RetroRepository {
	return &GORMRetroRepository{
		db: db,
	}
}

// {{{ Templates

func (repo *GORMRetroRepository) InsertTemplate(ctx context.Context, t Template) (Template, error) {
	err := repo.db.WithContext(ctx).Create(&t).Error
	return t, err
}

func (repo *GORMRetroRepository) UpdateTemplate(ctx context.Context, t Template) (Template, error) {
	err := repo.db.WithContext(ctx).Save(&t).Error
	return t, err
}

func (repo *GORMRetroRepository) GetTemplates(ctx context.Context) ([]Template, error) {
	var t []Template
	err := repo.db.WithContext(ctx).Preload("Questions").Find(&t).Error
	return t, err
}

func (repo *GORMRetroRepository) GetTemplateByID(ctx context.Context, tid int64) (Template, error) {
	var t Template
	err := repo.db.WithContext(ctx).Preload("Questions").Where("id = ?", tid).First(&t).Error
	return t, err
}

func (repo *GORMRetroRepository) DeleteTemplateByID(ctx context.Context, tid int64) error {
	err := repo.db.WithContext(ctx).Delete(&Template{}, tid).Error
	return err
}

// }}}
// {{{ Retro

func (repo *GORMRetroRepository) CreateRetro(
	ctx context.Context,
	tid int64,
	uid int64,
	name string,
) (Retro, error) {
	var retro Retro
	err := repo.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Get template
		t, err := repo.GetTemplateByID(ctx, tid)
		if err != nil {
			return err
		}

		retro.Name = name
		retro.UserID = uid

		for _, qt := range t.Questions {
			var q Question
			q.Content = qt.Content

			retro.Questions = append(retro.Questions, q)
		}

		err = tx.Create(&retro).Error
		if err != nil {
			return err
		}

		return nil
	})

	return retro, err
}

func (repo *GORMRetroRepository) GetRetros(ctx context.Context) ([]Retro, error) {
	var r []Retro
	err := repo.db.WithContext(ctx).Find(&r).Error
	return r, err
}

func (repo *GORMRetroRepository) GetRetroByID(ctx context.Context, rid int64) (Retro, error) {
	var r Retro
	err := repo.db.WithContext(ctx).
		Preload("Questions", func(db *gorm.DB) *gorm.DB {
			return db.Order("id ASC")
		}).
		Preload("Questions.Postits", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at ASC")
		}).
		Where("id = ?", rid).First(&r).Error
	return r, err
}

func (repo *GORMRetroRepository) DeleteRetroByID(ctx context.Context, rid int64) error {
	err := repo.db.WithContext(ctx).Delete(&Retro{}, rid).Error
	return err
}

// }}}
