FROM node:20-alpine

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy the entire workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps ./apps

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build all applications
RUN pnpm run build
