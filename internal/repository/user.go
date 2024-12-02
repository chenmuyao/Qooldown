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
	ID        int64  `gorm:"primaryKey;autoIncrement"`
	Username  string `gorm:"unique"`
	Password  string
	CreatedAt int64
	UpdatedAt int64
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
	now := time.Now().UnixMilli()
	u.CreatedAt = now
	u.UpdatedAt = now
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
