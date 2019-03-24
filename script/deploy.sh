#!/bin/bash

cp /home/ubuntu/.env /home/ubuntu/chatting-deploy/.env 
cp /home/ubuntu/Gemfile /home/ubuntu/chatting-deploy/Gemfile
cd /home/ubuntu/chatting-deploy

docker build -t app .
docker run -p 3031:3000 -d app