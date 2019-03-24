#!/bin/bash

cp /home/ubuntu/.env /home/ubuntu/chatting-deploy/.env 
cd /home/ubuntu/chatting-deploy

docker build -t app .
docker run -p 3031:3000 -d app