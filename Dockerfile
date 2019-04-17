FROM debian:stable-slim

# set up env
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

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

# expose ports
EXPOSE 5000
EXPOSE 1883
EXPOSE 6763

CMD ["node", "index.js"]
