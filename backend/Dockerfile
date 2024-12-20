ARG BASE=node:18-alpine
FROM ${BASE} AS base

# Create app directory and set permissions
WORKDIR /usr/src/app/agent-backend

# Install app dependencies
COPY package*.json ./
RUN npm install

COPY . .

# Expose port
EXPOSE 5005

# Production
FROM base AS agent-production


# Run the app using PM2
CMD ["npm", "run", "start"]

# Development
FROM base AS agent-development

# Bundle app source

CMD ["npm", "run", "dev"]