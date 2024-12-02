//go:build !docker

package config

var Config = config{
	DB: DBConfig{
		DSN: "root:root@tcp(localhost:3336)/qooldown",
	},
}
