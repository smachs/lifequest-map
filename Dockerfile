FROM node:lts-alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY . .
RUN npm ci
ARG VITE_API_ENDPOINT=
ARG VITE_PLAUSIBLE_API_HOST=
ARG VITE_PLAUSIBLE_DOMAIN=
ARG VITE_PATREON_BASE_URI=
RUN npm run build

ENV NODE_ENV production

EXPOSE 3001
CMD ["npm", "start"]