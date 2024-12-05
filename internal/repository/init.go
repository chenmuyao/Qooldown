package repository

import "gorm.io/gorm"

func InitTable(db *gorm.DB) error {
	return db.AutoMigrate(
		&User{},
		&Template{},
		&TemplateQuestion{},
		&Retro{},
		&Postit{},
		&Question{},
	)
}
