# Chamber website for Coolify (Build Pack: Dockerfile). No npm install: the server uses only Node built-ins.
FROM node:22-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=production PORT=3000 DATA_DIR=/data
# Submissions are saved to /data: mount a Coolify persistent volume there so they survive redeploys
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "server/index.js"]
