# Chat App demo

This is just a sample project to demonstrate how to write a messenger app with
the MERN stack (MongoDB, Express, React, Node). Integrated Google/Facebook sign
in function.

## Used

Backend: Koa.js, ws (WebSocket server), mongoose, ioredis  
Frontend: create-react-app (React-Redux with RTKQuery, created as a submodule)  
Database: MongoDB 6 (single container replica set for transaction), Redis 7 (for
pub/sub WebSocket messages)  
Deployment: Docker compose

JavaScript with ES6 modules syntax used for backend code.

## Environments

1. production
2. development
3. test

## ESModules notes

https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-js-when-using-es6-modules

```js
const **filename = new URL('', import.meta.url).pathname;

// Will contain trailing slash
const **dirname = new URL('.', import.meta.url).pathname;
```

## Cookies

https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies  
Only give cookies meaning in the areas where they are required. Because cookie
data (and session IDs) can be stolen using Cross-Site Scripting (XSS), it is
important to set cookies as being HTTPOnly. This setting makes cookies
unavailable to JavaScript and prevents their theft using XSS.

Set JWT cookie to: httpOnly, secure; also sign it!

"jwt": this contains the user JWT token for koa-jwt  
"jwt-exists": this is used for frontend app to track log-in state

## Other notes

Note that when you use wss/https, create-react-app must use the same credentials
for HTTPS or Chrome will block the connection.

For local development:

```
HTTPS=true SSL_CRT_FILE=./.certs/server.crt SSL_KEY_FILE=./.certs/server.key PORT=3001 react-scripts start
```

## Google coding style

Install and follow its instructions:  
https://github.com/google/eslint-config-google

Create .vscode/settings.json to format on save:

```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

Add rules to relax formatting:

```json
  "rules": {
    "no-unused-vars": [
      "warn",
      {
        "vars": "all",
        "args": "after-used",
        "ignoreRestSiblings": false
      }
    ]
  }
```

## MongoDB replica set (for transactions)

1. Check /etc/hosts file.
2. You run 'rs.initiate()' to start a single container replica set in
   run_docker_compose.sh.

## Scripts

1. Run "run_docker_compose.sh" to start up the system.
2. If you want to initialize the database with some data, run "npm run initdb"
   (optional).

## OpenAPI

Import into Postman.  
Next time, don't use HTTPS for local development!  
Also, use an object instead of an array for all JSON responses!
