# Dockerfile for Next.js application

# Stage 1: Install dependencies
# This stage is used to cache dependencies and speed up subsequent builds
FROM node:20-alpine AS deps
# RUN apk add --no-cache libc6-compat # Uncomment if you encounter issues with native modules
WORKDIR /app
COPY package.json package-lock.json* ./
# Using --frozen-lockfile to ensure reproducibility from the lock file
RUN npm install --frozen-lockfile

# Stage 2: Build the application
# This stage builds the Next.js application
FROM node:20-alpine AS builder
WORKDIR /app
# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application code
COPY . .
# Set build-time environment variables if necessary
# Example: ARG NEXT_PUBLIC_SOME_VAR
# ENV NEXT_PUBLIC_SOME_VAR=${NEXT_PUBLIC_SOME_VAR}
RUN npm run build

# Stage 3: Production image
# This stage creates the final, lean production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# It's good practice to run as a non-root user.
# Create a non-root user and group for the app to run as.
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs
# USER nextjs

# Copy necessary files from the 'builder' stage
COPY --from=builder /app/public ./public
# The .next folder contains the optimized build output
COPY --from=builder /app/.next ./.next
# Copy package.json to install production dependencies and run start script
COPY --from=builder /app/package.json ./package.json
# Copy next.config.js as it might be needed by 'next start'
COPY --from=builder /app/next.config.ts ./next.config.ts
# Copy the lock file to ensure consistent prod dependencies installation
COPY --from=builder /app/package-lock.json* ./

# Install only production dependencies
# --omit=dev is for npm v7+. For older npm versions, use --production.
RUN npm install --omit=dev --frozen-lockfile

# Expose the port the app runs on (Next.js default is 3000)
EXPOSE 3000

# Set the command to start the app
# The 'start' script is defined in package.json as "next start"
CMD ["npm", "run", "start"]
