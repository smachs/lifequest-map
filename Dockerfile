FROM node:lts-alpine AS builder
WORKDIR /app

COPY . .
RUN npm ci
ARG VITE_API_ENDPOINT=
ARG VITE_PLAUSIBLE_API_HOST=
ARG VITE_PLAUSIBLE_DOMAIN=
RUN npm run build -- --filter=api
RUN npm run build -- --filter=www
RUN npm set-script prepare ""

FROM node:lts-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001
CMD ["npm", "start"]