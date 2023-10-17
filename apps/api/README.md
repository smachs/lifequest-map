# API

You can start by copying the template environment variables file.

```
cp .env.template .env
```

The following list shows the variables you need to set:

| KEY                         | VALUE                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| PORT                        | Port for the server environment                                                                         |
| NO_SOCKET                   | Run server without Socket for live position. Useful if you run multiple servers. Possible value: "true" |
| NO_API                      | Run server without API and database. Useful if you run multiple servers. . Possible value: "true"       |
| MONGODB_URI                 | URI of your [MongoDB](https://docs.mongodb.com/manual/) server                                          |
| VITE_API_ENDPOINT           | URL of your server environment                                                                          |
| SCREENSHOTS_PATH            | Server side path to a folder in which screenshots will be saved                                         |
| DISCORD_PUBLIC_WEBHOOK_URL  | Discord Webhook for public activity log                                                                 |
| DISCORD_PRIVATE_WEBHOOK_URL | Discord Webhook for private activity log                                                                |
| STEAM_API_KEY               | [Steam API](https://steamcommunity.com/dev/apikey) key required for oAuth                               |
| SESSION_SECRET              | Secret used to sign the session cookie                                                                  |
