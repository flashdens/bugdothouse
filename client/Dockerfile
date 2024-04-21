# Use an official Node runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
RUN mkdir -p "/app/client"
WORKDIR /app/client

# Copy the package.json and package-lock.json files to the working directory
COPY . .

# Install dependencies
RUN npm install

# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "dev"]
