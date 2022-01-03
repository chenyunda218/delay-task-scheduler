# syntax=docker/dockerfile:1
FROM node:17.3.0 as build-stage
WORKDIR /app
COPY src/ ./src/
COPY yarn.lock ./
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install -g typescript
RUN yarn install
RUN tsc

FROM node:17.3.0 as production-stage
WORKDIR /app
COPY --from=build-stage /app/dist /app/dist
COPY --from=build-stage /app/node_modules /app/node_modules
EXPOSE 5213
CMD ["node", "dist/main.js"]