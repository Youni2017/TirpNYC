
FROM node:18-alpine AS frontend-builder
WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm install --prefix ./frontend

COPY . .

RUN npm run --prefix ./frontend build

FROM node:18-alpine AS backend-deps
WORKDIR /app
COPY backend/package*.json ./backend/
RUN npm install --prefix ./backend

FROM node:18-alpine AS final
WORKDIR /app

COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules

COPY backend/package*.json ./backend/
COPY backend/queries.js ./backend/
COPY backend/tripnyc_backend.js ./backend/

COPY --from=frontend-builder /app/frontend/dist ./backend/public

EXPOSE 3001

CMD ["node", "backend/tripnyc_backend.js"]