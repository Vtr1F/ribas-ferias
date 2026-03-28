# syntax=docker/dockerfile:1

ARG NODE_VERSION=25.8.2
FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=development

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm install

# Copy the rest of the project
COPY . .

# Vite default port
EXPOSE 5173

# Run Vite dev server
CMD ["npm", "run", "dev", "--", "--host"]
