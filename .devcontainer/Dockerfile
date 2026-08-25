FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Keycloakify's build tooling shells out to Maven to assemble the theme JAR.
RUN apt-get update && apt-get install -y --no-install-recommends maven \
    && rm -rf /var/lib/apt/lists/*
