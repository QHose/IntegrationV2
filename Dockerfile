FROM node:v14.21
LABEL maintainer="Martijn Biesbroek"
EXPOSE 3000

# List the contents of the current directory to verify the presence of the file
RUN ls -la

# Copy the bundle directory to the container
ADD . /meteorQRS

# Check if the settings file exists
RUN ls -la /meteorQRS/programs/server/

# Add the settings-example file to the container
ADD ./settings-development-example.json /meteorQRS/programs/server/

WORKDIR /meteorQRS/programs/server
RUN npm install

WORKDIR /meteorQRS
CMD ["bash", "./startNode.sh"]
