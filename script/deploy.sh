#!/bin/bash

cp /home/ubuntu/.env /home/ubuntu/chatting-deploy/.env 
cd /home/ubuntu/chatting-deploy

if [ "$(docker ps | grep "app-chatting")" != "" ]; then
  docker rm -f $(docker ps | grep "app-chatting")
fi
if [ "$(docker images | grep "app-chatting")" != "" ]; then
  docker rmi -f $(docker images | grep "app-chatting")
fi

docker build -t app-chatting .
docker run --name app-chatting -p 3031:3000 -d app-chatting