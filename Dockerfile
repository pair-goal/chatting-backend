FROM node:10.15

ENV NODE_ENV production

COPY . .
RUN npm i

EXPOSE 3000
CMD ["npm", "start"]