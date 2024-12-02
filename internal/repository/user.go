package repository

type User struct {
	ID        int64  `gorm:"primaryKey,autoIncrement"`
	Username  string `gorm:"unique,type=varchar(128)"`
	Password  string
	CreatedAt int64
	UpdatedAt int64
}
