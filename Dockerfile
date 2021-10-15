FROM node:14

# Install backend dependencies
WORKDIR /usr/src/app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Install client dependencies
WORKDIR /usr/src/app/client
COPY client/package*.json ./
RUN npm ci --only=production

# Copy files
WORKDIR /usr/src/app
COPY . .

# Build client
WORKDIR /usr/src/app/client
RUN npm run build

# Run node server
WORKDIR /usr/src/app/backend
EXPOSE 3000
CMD [ "npm", "start" ]