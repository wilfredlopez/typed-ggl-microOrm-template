# Express + Micko-Orm(MongoDB) + TypeScript Template

1. Install dependencies via `yarn` or `npm install`
2. Run `docker-compose up -d` to start mongodb
3. Run via `yarn dev` (watch mode)
4. Example API is running on localhost:5000

### GraphQl Playground

Playground will be available at http://localhost:5000/graphql

#### KILL Docker Mongo DB

1. find the process running `docker ps` and get the `ID`.
2. `docker stop {ID}`
3. IF you want to remove the image use `docker rm {ID}`

&nbsp;

##### Stop All Containers

```docker
  docker stop `docker ps -qa`
```

###### Remove All Containers

```docker
  docker rm `docker ps -qa`
```

###### Remove All Images

```docker
  docker rmi -f `docker images -qa`
```

###### Remove All Volumes

```docker
  docker volume rm $(docker volume ls -qf dangling="true")
```

###### Remove All Networks

```docker
  docker network rm `docker network ls -q`
```
