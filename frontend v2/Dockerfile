FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

# Expose Vite dev server port
EXPOSE 5175

# Start Vite ensuring it binds to 0.0.0.0 so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5175"]
