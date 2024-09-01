# GENERATE IMAGE: DOCKER_BUILDKIT=0 docker build -t techverso/microservice-hexagonal:v0.0.1 . 
FROM node:20.17-alpine3.19

WORKDIR /app

COPY nest-cli.json package.json tsconfig.json tsconfig.build.json .develop.env ./
COPY src/ ./src

RUN npm install \
  && npm run build \
  && rm -rf src/

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start:prod" ]
