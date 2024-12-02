all: dev

test:
	@go test ./...

dev:
	@rm -f ./qooldown
	@go mod tidy
	@go build -v -o qooldown .

up:
	@rm -f ./qooldown
	@go mod tidy
	@go build -o qooldown --tags=docker .
	@docker compose up -d --build

down:
	@docker compose down
