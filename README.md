## Students Pick Up Service

- Receive connections from monitors who wants to know which students can be delivered
  - emit events to let them know the dynamic list of responsibles that are coming

- Receive responsible messages to mantain responsible data on redis database which is needed by ranking algorithm

- Clean Ranking stuff every day due to Redis TTL limitions on sorted sets data structure
### Run Redis Locally with docker

- `docker run --name students-pickup-redis -p 6379:6379 -d redis:7 redis-server --maxmemory-policy allkeys-lru`

- `ZRANGE ranking::school::1 0 -1`

### Install K6 from github

- :warning: not compatible with Socket.io protocol
- curl -L https://github.com/grafana/k6/releases/download/v0.39.0/k6-v0.39.0-linux-amd64.deb > k6.deb

### Install Artillery

- npm install -g artillery@latest
