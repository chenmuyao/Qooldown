package service

import (
	"context"
	"errors"

	"github.com/chenmuyao/qooldown/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrDuplicatedUser        = repository.ErrDuplicatedUser
	ErrInvalidUserOrPassword = errors.New("wrong email or password")
)

type UserService interface {
	SignUp(ctx context.Context, u repository.User) (repository.User, error)
	Login(ctx context.Context, username string, password string) (repository.User, error)
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{
		repo: repo,
	}
}

func (svc *userService) SignUp(ctx context.Context, u repository.User) (repository.User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return repository.User{}, err
	}

	u.Password = string(hash)
	return svc.repo.Insert(ctx, u)
}

func (svc *userService) Login(
	ctx context.Context,
	username string,
	password string,
) (repository.User, error) {
	u, err := svc.repo.FindByUsername(ctx, username)
	if err == repository.ErrUserNotFound {
		return repository.User{}, ErrInvalidUserOrPassword
	}
	if err != nil {
		return repository.User{}, err
	}
	// check the password
	err = bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	if err != nil {
		return repository.User{}, ErrInvalidUserOrPassword
	}
	return u, nil
}
