FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install \
apk add --no-cache mongodb
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3000 27017 28017

CMD [ "npm", "start" ]
CMD [ "mongod", "--bind-ip", "0.0.0.0" ]

