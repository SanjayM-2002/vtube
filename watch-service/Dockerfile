
FROM node:alpine


WORKDIR /usr/src/app


COPY package*.json ./


RUN npm install

COPY prisma ./prisma/

RUN npx prisma generate


COPY . .


EXPOSE 5001


CMD ["npm", "run", "dev"]
