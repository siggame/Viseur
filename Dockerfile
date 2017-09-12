FROM node:latest
LABEL maintainer=siggame@mst.edu

ADD . vis
WORKDIR vis

RUN npm install
RUN npm run bundle

CMD ["npm", "run", "start"]
