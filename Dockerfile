# Use official Node.js 14 as base image
FROM node:16.20.2-buster-slim

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the server code
COPY . .

# Set the default PORT used by the app and expose it
ENV PORT=5002
EXPOSE 5002

# Default command to start the application
CMD ["npm", "start"]
