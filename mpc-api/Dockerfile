FROM node:20-alpine

WORKDIR /app

# Install dependencies first to leverage Docker layer caching
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
