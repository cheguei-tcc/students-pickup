## Students Pick Up Service

- Receive connections from monitors who wants to know which students can be delivered
  - emit events to let them know the dynamic list of responsibles that are coming

- Receive responsible messages to mantain responsible data on redis database which is needed by ranking algorithm

- Clean Ranking stuff every day due to Redis TTL limitions on sorted sets data structure
### Run Redis Locally with docker

- `docker run --name students-pickup-redis -p 6379:6379 -d redis:7 redis-server --maxmemory-policy allkeys-lru`