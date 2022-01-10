## Adapted from https://github.com/Waltari10/proxy-tutorial-frontend

FROM nginx:1.20.2

# Update packages and install nodejs and npm
RUN apt-get update
RUN apt-get install curl -y
RUN curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt install nodejs -y

# Install frontend dependencies
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --production

# Build frontend
COPY . .
RUN npm run build -- --profile

# Configure Nginx for Heroku
COPY nginx.default.conf.template /etc/nginx/conf.d/default.conf.template
EXPOSE $PORT

# Replace environment variables in nginx config file
CMD /bin/bash -c "envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf" && nginx -g 'daemon off;'
