
# TaskTrackr

Simple task tracking with small teams in mind.


## Features

- Light/dark mode toggle
- User registration + login
- 2FA using authenticator apps
- Task and Project mangement
- Sorting and filtering of tasks
- Simple statisitics dashboard
- Webhook integration
- User-facing and internal APIs
- API keys for authentication



## Deployment
Recomended to deploy with supplied docker-compose.yml - comes with healthchecking and inbuilt MySQL server. Config supplied should work out of the box.

Using either Docker or Bare Metal methods requires no pre-config of the database - TaskTrackr-API will create and populate all tables it needs.

Deploy TaskTrackr on bare metal

```bash
  cd ./TaskTrackr-API/
  node app.js

  cd ./TaskTrackr/
  node server.js
```
    
Bare metal deployment will need adjustment of environment variables - see [Environment Variables](#environment-variables)
## Environment Variables


To run this project you will need to add the following environment variables to your .env file. These do not apply for Docker installs, as these are provided in the compose file.

#### TaskTrackr-API

      DB_HOST: Address to DB
      DB_USER: DB Username
      DB_PASSWORD: DB Password
      DB_NAME: DB Name
      DB_PORT: DB Port
      SERVER_PORT: Server Port
      INTERFACE_ADDRESS: Server address - typically 0.0.0.0
      ACCESS_TOKEN_SECRET: String used to generate JWTs - should be large, random, and a secret

#### TaskTrackr

      API_BASE: Address to API server, e.g. http://tasktrackr-api:3001
      ACCESS_TOKEN_SECRET: Should match that given above
      SERVER_PORT: Server Port
      INTERFACE_ADDRESS: Server address - typically 0.0.0.0
      DB_METHOD: db-api
Note: leave `DB_METHOD` set to `db-api` - this is used to set the DataHandler that TaskTrackr-UI uses to access the data it needs. TaskTrackr-UI was written to talk directly to the DB until late in the development cycle, so while `db-api` is the only acceptable DataHandler in the finished build, the dynamic loading of DataHandlers is considered core functionality of TaskTrackr
