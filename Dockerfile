# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the project
COPY . .

# Set environment variables (will be passed from Fly)
ENV NODE_ENV production

# Start your bot
CMD ["node", "final-telegram-bot.js"]
