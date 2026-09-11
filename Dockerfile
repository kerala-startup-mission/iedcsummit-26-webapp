# syntax=docker/dockerfile:1

# ---- build ----------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Vite inlines VITE_* values into the bundle at build time, so every event setting has
# to be present now — setting them on `docker run` would have no effect. Defaults match
# .env.example; override any of them with --build-arg to point the image at another event.
ARG VITE_EVENT_BASE_URL="https://events.startupmission.in"
ARG VITE_EVENT_SLUG="iedc-summit-2026"
ARG VITE_EVENT_BANNER="/summit-hero.png"
ARG VITE_EVENT_NAME="IEDC Summit 2026"
ARG VITE_EVENT_DATE="28 September 2026"
ARG VITE_EVENT_VENUE="Sahrdaya College of Engineering & Technology, Kodakara, Thrissur"
ARG VITE_EVENT_SPEAKER_CATEGORIES=""
ENV VITE_EVENT_BASE_URL=$VITE_EVENT_BASE_URL \
    VITE_EVENT_SLUG=$VITE_EVENT_SLUG \
    VITE_EVENT_BANNER=$VITE_EVENT_BANNER \
    VITE_EVENT_NAME=$VITE_EVENT_NAME \
    VITE_EVENT_DATE=$VITE_EVENT_DATE \
    VITE_EVENT_VENUE=$VITE_EVENT_VENUE \
    VITE_EVENT_SPEAKER_CATEGORIES=$VITE_EVENT_SPEAKER_CATEGORIES

RUN corepack enable

# Dependencies are their own layer so source edits don't re-resolve the lockfile.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---- runtime --------------------------------------------------------------
FROM nginx:1.29-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Runs before nginx starts, rewriting config.js from the container's VITE_* variables.
# This is what lets runtime environment variables reconfigure an already-built image;
# the build args above only set the baked-in defaults it falls back to.
COPY docker/40-write-config.sh /docker-entrypoint.d/40-write-config.sh

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
