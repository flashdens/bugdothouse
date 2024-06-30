# Use the official Node.js image as the base image
FROM node:18-slim

# Create and set the working directory
RUN mkdir -p /app/client
WORKDIR /app/client

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Set environment variables
ENV WATCHPACK_POLLING=true
ENV NEXT_TELEMETRY_DISABLED=1

# Specify the default command to run in the container
CMD ["npm run build"]


