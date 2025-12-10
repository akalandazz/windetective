# Build stage
FROM node:25-alpine as build

WORKDIR /app

# Copy package files
COPY webapp/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY webapp/ ./

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/out /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]