package config

type config struct {
	DB DBConfig
}

type DBConfig struct {
	DSN string
}
