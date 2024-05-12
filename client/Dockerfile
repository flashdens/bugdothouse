# Use an official Node runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
RUN mkdir -p "/app/client"
WORKDIR /app/client

# Copy the package.json and package-lock.json files to the working directory
COPY . .

ENV WATCHPACK_POLLING true
ENV NEXT_TELEMETRY_DISABLED 1

# Install dependencies
RUN npm install
# Start the Next.js app
CMD ["npm", "run", "dev"]
