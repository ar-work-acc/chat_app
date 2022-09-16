# Create keyfile for MongoDB single container replica set
FROM mongo:6-focal

WORKDIR /opt

# man openssl rand
RUN openssl rand -out keyfile -base64 768
RUN chown 999:999 ./keyfile
RUN chmod 600 ./keyfile 
