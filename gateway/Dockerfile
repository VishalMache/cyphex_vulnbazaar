FROM node:20-slim

WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY . .

# CWE: Container Running as Root — no USER directive, runs as root by default.
EXPOSE 3000
CMD ["node", "server.js"]
