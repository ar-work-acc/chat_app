#!/bin/bash

# Script to clean and rebuild/run Docker compose:
usage() {
    echo "Usage: $0 [-fd]" >&2
    echo "Run Docker compose" >&2
    echo "  -f  full (clean, build, and redeploy)" >&2
    echo "  -d  re-build/deploy custom images only" >&2
    exit 1
}

if [[ "$#" -lt 1 ]]
then
    usage
fi

REBUILD=0

while getopts fd OPTION
do
    case $OPTION in
        f) REBUILD=1 ;;
        d) REBUILD=0 ;;
        ?) usage ;;
    esac
done

if [[ $REBUILD = 1 ]]
then
  echo 'Docker compose down!'
  docker compose down
fi

docker image prune -f
docker volume prune -f
docker network prune -f

if [[ $REBUILD = 1 ]]
then
# building React code
  echo 'Re-build CRA...'
  npm install --prefix app
  npm run build --prefix app
fi

# Docker compose up
docker compose up -d --build

if [[ $REBUILD = 1 ]]
then
# init MongoDB replica set
  echo 'Initialize MongoDB replica set... (wait 10 seconds)'
  sleep 10
  docker exec -it mongo mongosh -u root -p pw2022mdb --eval "rs.initiate()"
fi

docker container ls -a
echo 'Done!'