# Сборка фронтенда
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG VITE_APP_ID=local
ARG VITE_BASE44_APP_ID=
ARG VITE_BASE44_FUNCTIONS_VERSION=
ARG VITE_BASE_PATH=/

ENV VITE_APP_ID=$VITE_APP_ID \
    VITE_BASE44_APP_ID=$VITE_BASE44_APP_ID \
    VITE_BASE44_FUNCTIONS_VERSION=$VITE_BASE44_FUNCTIONS_VERSION \
    VITE_BASE_PATH=$VITE_BASE_PATH

RUN npm run build

# Продакшен: nginx отдаёт статику
FROM nginx:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1
