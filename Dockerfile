
FROM node:16.10.0 as build

WORKDIR /app

COPY .npmrc ./.npmrc
COPY package.json ./package.json
# install dependecies
RUN npm install --legacy-peer-deps

COPY . ./

# Production source maps for Pholly upload (optional); set GENERATE_SOURCEMAP=false to disable
ENV GENERATE_SOURCEMAP=true

# build the application in prod mode
RUN npm run build

ARG UPLOAD_SOURCEMAPS=true
ARG API_BASE_URL=https://apm-pholly.phenom.com/api
RUN if [ "$UPLOAD_SOURCEMAPS" = "true" ]; then \
      echo "Uploading sourcemaps..."; \
      API_BASE_URL=${API_BASE_URL} node scripts/upload-sourcemaps.js || echo "Sourcemap upload failed, continuing build..."; \
    else \
      echo "Skipping sourcemap upload"; \
    fi
# RUN npm run test 

FROM nginx:stable-alpine
EXPOSE 80

COPY nginx.conf  /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /var/www/html/


# Copy .env file and shell script to container
WORKDIR /var/www/html
COPY ./env.sh .
COPY .env .

# Add bash
RUN apk add --no-cache bash

# Make our shell script executable
RUN chmod +x env.sh

# Start Nginx server
CMD ["/bin/bash", "-c", "/var/www/html/env.sh && nginx -g \"daemon off;\""]