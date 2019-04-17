FROM debian:stable-slim

# set apt to noninteractive shell
ENV DEBIAN_FRONTEND=noninteractive

# update package definitions
RUN apt-get update

# install tools
RUN apt-get install apt-utils curl -y

# install nodejs
WORKDIR /root
RUN curl -sL -o node_setup.sh https://deb.nodesource.com/setup_10.x && \
	bash node_setup.sh && \
	apt-get install nodejs -y && \
	node -v && \
	npm -v

# copy files for hub
RUN mkdir -p /opt/keeco-hub
WORKDIR /opt/keeco-hub
COPY build/ ./
COPY package.json package-lock.json ./

# install dependencies
RUN npm ci --only=production

# set up
EXPOSE 5000
CMD ["node", "index.js"]