# Common build stage
FROM node:20.0.0-alpine as common-build-stage

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "build:tsc"]

# Development build stage
FROM common-build-stage as development-build-stage

ENV NODE_ENV development

CMD ["npm", "run", "dev"]

# Production build stage
FROM common-build-stage as production-build-stage

ENV NODE_ENV production

CMD ["npm", "run", "start"]
