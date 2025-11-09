# build stage (opsional kalau ada build step)
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --only=production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
