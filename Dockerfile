FROM ubuntu:latest
COPY qooldown /app/qooldown
WORKDIR /app
ENTRYPOINT [ "/app/qooldown" ]
