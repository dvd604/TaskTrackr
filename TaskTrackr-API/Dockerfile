FROM node:20-alpine
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
HEALTHCHECK --interval=60s --timeout=10s --start-period=15s CMD node healthcheck.js
EXPOSE 3000
CMD [ "node", "app.js" ]