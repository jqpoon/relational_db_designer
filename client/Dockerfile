## Adapted from https://github.com/Waltari10/proxy-tutorial-frontend

# Get Nginx image from Docker hub
FROM nginx:1.20.2

# Update available packages in Debian
RUN apt-get update
# Install curl cmd line tool
RUN apt-get install curl -y
# Fetch latest node v14.x from nodesource
RUN curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh
# Run setup script
RUN bash nodesource_setup.sh
# install nodejs and npm
RUN apt install nodejs -y

# Change work dir
WORKDIR /usr/src/app
# Only copy package files
COPY package*.json ./
# Do a clean install based on package-lock file
RUN npm ci --production
 
# Copy nginx configuration file
COPY nginx.default.conf.template /etc/nginx/conf.d/default.conf.template
# Configure Nginx for Heroku
CMD /bin/bash -c "envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf" && nginx -g 'daemon off;'

# Copy everything else
COPY . .
# Build frontend
RUN npm run build -- --profile
# Expose port picked by Heroku
EXPOSE $PORT
