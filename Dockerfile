FROM node:24-alpine AS builder
RUN corepack enable pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm config set ignore-scripts true && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
