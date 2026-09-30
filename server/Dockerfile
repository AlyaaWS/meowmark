FROM golang:alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go mod tidy
RUN go build -o server ./cmd/api

FROM alpine:latest

WORKDIR /app

RUN apk --no-cache add ca-certificates && \
    mkdir -p /app/uploads && \
    chmod 777 /app/uploads

COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]
