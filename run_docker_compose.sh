#!/bin/bash
docker compose down
docker image prune -f
docker volume prune -f

docker compose up -d --build
docker container ls -a

sleep 10
docker exec -it mongo mongosh -u root -p pw2022mdb --eval "rs.initiate()"