all: dev

test:
	@go test ./...

dev:
	@rm -f ./qooldown
	@go mod tidy
	@go build -o qooldown .

up: dev
	@docker compose up -d --build

down:
	@docker compose down
