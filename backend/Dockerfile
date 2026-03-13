# Use Node.js as the base image
FROM node:20-slim

# Install OpenJDK 21
RUN apt-get update && \
    apt-get install -y openjdk-21-jdk-headless && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application
COPY . .

# Create the temp directory for compilation storage
RUN mkdir -p temp && chmod 777 temp

# Set environmental variables
ENV PORT=5000
ENV NODE_ENV=production

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
