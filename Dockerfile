# Use Node.js 22 as the base image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app (optional, depending on your setup)
RUN npm run build

# Expose the port the app runs on (Vite defaults to 5173)
EXPOSE 5173

# Start the React app using Vite
CMD ["npm", "start"]