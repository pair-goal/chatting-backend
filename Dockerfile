FROM node:10.15

COPY . .
RUN bundle install --path ./gem

EXPOSE 3000
CMD ["npm", "start"]