//go:build docker

package config

var Config = config{
	DB: DBConfig{
		DSN: "root:root@tcp(mysql:3306)/qooldown?parseTime=true",
	},
}
