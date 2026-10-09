FROM node:20-alpine

# Install build tools for native dependencies
RUN apk add --no-cache python3 make g++

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

WORKDIR /app

# Copy the entire workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps ./apps

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build all applications
RUN pnpm run build
