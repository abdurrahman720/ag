# Use an official Node runtime as a parent image
ARG BASE=node:16-alpine
FROM ${BASE} AS base

# Set the working directory in the container
WORKDIR /usr/src/app/agent-frontend

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .



# Expose port 3000
EXPOSE 5175

FROM base AS agent-production
#Build the app for production
RUN npm run build

#Install serve to run the application
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]

FROM base AS agent-development
CMD ["npm", "run", "dev"]

# Serve the app
# CMD ["serve", "-s", "build", "-l", "3000"]
