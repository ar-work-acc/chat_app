#!/bin/bash
docker compose down
docker image prune -f
docker volume prune -f
docker network prune -f

# building React code
npm install --prefix app
npm run build --prefix app

# Docker compose up
docker compose up -d --build
docker container ls -a

sleep 10
docker exec -it mongo mongosh -u root -p pw2022mdb --eval "rs.initiate()"