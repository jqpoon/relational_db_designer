FROM node:14

# Install backend dependencies
WORKDIR /usr/src/app/backend
COPY package*.json ./
RUN npm ci

# Copy files
COPY . .
RUN [ "npm", "run", "build" ]

# Run node server
EXPOSE $PORT
CMD [ "npm", "run", "start" ]