FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false && \
    npm install -g @expo/ngrok@4.1.3
COPY . .
EXPOSE 19000 19001 19002 19006
CMD ["npx", "expo", "start", "--tunnel", "--clear"]
