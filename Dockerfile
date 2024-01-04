FROM oven/bun:1

WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile --ignore-scripts 
ARG VITE_API_ENDPOINT=
ARG VITE_PLAUSIBLE_API_HOST=
ARG VITE_PLAUSIBLE_DOMAIN=
RUN bun run build

ENV NODE_ENV production

EXPOSE 3001
CMD ["bun", "start"]