# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
WORKDIR /usr/src/app

COPY . .
RUN bun install --frozen-lockfile

ENV NODE_ENV=production
RUN bun run test
ARG VITE_API_ENDPOINT=
ARG VITE_PLAUSIBLE_API_HOST=
ARG VITE_PLAUSIBLE_DOMAIN=
RUN bun run build

# run the app
USER bun
EXPOSE 3001/tcp
ENTRYPOINT [ "bun", "start" ]
