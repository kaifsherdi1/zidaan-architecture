# syntax=docker/dockerfile:1

# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app

# API base URL is baked in at build time (Vite). Same-origin by default:
# the edge proxy routes /api and /storage on this host to the backend.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Serve ----------
FROM nginx:1.27-alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
