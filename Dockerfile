FROM node:16-buster-slim

WORKDIR /app/

RUN apt-get update \
  && apt-get install -y build-essential curl --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man \
  && apt-get clean \
  && mkdir -p /node_modules && chown node:node -R /node_modules /app

USER node

COPY --chown=node:node package.json package-lock.json ./

RUN npm ci

ARG NODE_ENV="development"
ARG LOG_LEVEL="debug"
ARG PORT="5400"
# ARG DATABASE_URL=
ENV NODE_ENV="${NODE_ENV}" \
  PATH="${PATH}:/node_modules/.bin" \
  USER="node" \
  # DATABASE_URL="${DATABASE_URL}" \
  LOG_LEVEL="${LOG_LEVEL}" \
  PORT="${PORT}"

COPY --chown=node:node . .
EXPOSE 5400

CMD npm run start
