FROM ubuntu:latest
COPY qooldown /app/qooldown
WORKDIR /app
CMD [ "/app/qooldown" ]
