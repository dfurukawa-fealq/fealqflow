FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci
FROM dependencies AS frontend-build
COPY . .
ARG VITE_BASE_PATH=/
ENV VITE_BASE_PATH=$VITE_BASE_PATH
RUN npx vite build --config apps/frontend/vite.config.ts
FROM nginx:1.27-alpine AS frontend
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY template /usr/share/nginx/html/templates
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
FROM node:22-bookworm-slim AS backend
WORKDIR /app
ENV NODE_ENV=production
ENV API_PORT=3333
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY apps/backend/server ./apps/backend/server
COPY apps/backend/migrations ./apps/backend/migrations
COPY data ./data
COPY template ./template
RUN mkdir -p /app/database
EXPOSE 3333
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3333/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "apps/backend/server/index.mjs"]
