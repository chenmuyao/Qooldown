package repository

import (
	"context"
	"errors"
	"time"

	"github.com/go-sql-driver/mysql"
	"gorm.io/gorm"
)

var (
	ErrDuplicatedUser = errors.New("username already exists")
	ErrUserNotFound   = gorm.ErrRecordNotFound
)

type User struct {
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	ID        int64          `json:"id"         gorm:"primarykey;autoIncrement"`

	Username string `gorm:"unique" json:"username"`
	Password string `              json:"password"`
}

type UserRepository interface {
	Insert(ctx context.Context, u User) (User, error)
	FindByUsername(ctx context.Context, username string) (User, error)
	FindByID(ctx context.Context, id int64) (User, error)
}

type GORMUserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &GORMUserRepository{
		db: db,
	}
}

func (repo *GORMUserRepository) Insert(ctx context.Context, u User) (User, error) {
	res := repo.db.WithContext(ctx).Create(&u)
	err := res.Error
	if me, ok := err.(*mysql.MySQLError); ok {
		const duplicateErr = 1062
		if me.Number == duplicateErr {
			// username conflict
			return User{}, ErrDuplicatedUser
		}
	}
	return u, err
}

func (repo *GORMUserRepository) FindByUsername(ctx context.Context, username string) (User, error) {
	var u User
	err := repo.db.WithContext(ctx).Where("username=?", username).First(&u).Error
	return u, err
}

func (repo *GORMUserRepository) FindByID(ctx context.Context, id int64) (User, error) {
	var u User
	err := repo.db.WithContext(ctx).Where("id=?", id).First(&u).Error
	return u, err
}
