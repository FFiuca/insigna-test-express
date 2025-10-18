FROM node:24-alpine as build

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY jest.config.js ./
COPY nodemon.json ./

RUN npm install
RUN npm run build

FROM node:24-alpine as production

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/index.js"]
