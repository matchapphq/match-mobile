FROM oven/bun:1

WORKDIR /app

COPY . /app/

RUN bun i

EXPOSE 8081

CMD ["bunx", "expo", "start", "--host", "tunnel", "--port", "8081", "--no-dev", "--minify"]
