# Build stage
FROM golang:1.22-alpine AS builder
WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o syncsketch .

# Run stage
FROM alpine:3.19
RUN apk --no-cache add ca-certificates
WORKDIR /app

COPY --from=builder /app/syncsketch .
# Persist board data (optional volume mount at /app/data)
ENV PORT=8080
EXPOSE 8080

CMD ["./syncsketch"]
