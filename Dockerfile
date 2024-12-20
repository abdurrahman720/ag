# Use an official Node runtime as a parent image
ARG BASE=node:20-alpine
FROM ${BASE} AS base

# Set the working directory in the container
WORKDIR /usr/src/app/agentbarge

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .



# Expose port 3000
EXPOSE 5175

FROM base AS dms-production
#Build the app for production
RUN npm run build

#Install serve to run the application
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]

FROM base AS dms-development
CMD ["npm", "start"]

# Serve the app
# CMD ["serve", "-s", "build", "-l", "3000"]
