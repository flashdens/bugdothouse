# Use the official Node.js 20 slim image as the base image
FROM node:20-slim

# Create and set the working directory
WORKDIR /bugdothouse/client

# Copy package.json and package-lock.json (if available) to the working directory
COPY package.json package-lock.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Set environment variables
ENV WATCHPACK_POLLING=true
ENV NEXT_TELEMETRY_DISABLED=1

# Expose the port that the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "dev"]

