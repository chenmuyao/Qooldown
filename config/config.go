package config

type config struct {
	DB DBConfig
}

type DBConfig struct {
	DSN string
}

var Config = config{
	DB: DBConfig{
		DSN: "root:root@tcp(mysql:3306)/qooldown",
	},
}
