# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Expose the port that your application will run on
EXPOSE 8080

# Define the command to run your application
CMD [ "npm", "start" ]
