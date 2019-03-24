FROM node:10.15

COPY . .
RUN npm i

EXPOSE 3000
CMD ["npm", "start"]