FROM node:lts-alpine
WORKDIR /app

COPY . .
RUN npm ci
ARG VITE_API_ENDPOINT=
ARG VITE_PLAUSIBLE_API_HOST=
ARG VITE_PLAUSIBLE_DOMAIN=
RUN npm run build
RUN npm set-script prepare ""

ENV NODE_ENV production

EXPOSE 3001
CMD ["npm", "start"]