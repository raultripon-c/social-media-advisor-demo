FROM node:16.3.0-alpine
ARG PROJECT_NAME="txe-ui"
COPY package.json ./
COPY tsconfig.json ./
COPY tsconfig.prod.json ./
COPY src ./src
RUN ls -a
## this is stage two , where the app actually runs
COPY package.json ./
RUN npm install
RUN npm run build
RUN npm install pm2 -g
WORKDIR /dist
EXPOSE 8080
CMD ["pm2-runtime","index.js"]
