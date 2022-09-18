FROM node:16

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
RUN npm ci --only=production

# Bundle app source
COPY src ./src
COPY .certs ./.certs

# env
ENV NODE_ENV="production"

ENV WS_NO_BUFFER_UTIL=1
ENV WS_NO_UTF_8_VALIDATE=1
ENV MONGODB_HOST="mongo"
ENV MONGODB_PORT=27017
ENV MONGODB_USERNAME="root"
ENV MONGODB_PASSWORD="pw2022mdb"
ENV MONGODB_REPLICA_SET_NAME="myReplicaSet"
ENV MONGODB_DB_NAME="chat"
ENV ORIGIN="https://localhost:3001"
ENV REDIS_HOSTNAME="redis"

ENV PORT="3000"

EXPOSE 3000

CMD [ "node", "--es-module-specifier-resolution=node", "src/server.js" ]
