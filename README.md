# Chat App (pure JavaScript)

Use Redis for pub/sub (ioredis).

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

1. Note that when you use wss, create-react-app must use the same credentials
   for HTTPS or Chrome will block the connection.

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
    "max-len": [
      "error",
      {
        "code": 120
      }
    ],
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

1. Check /etc/hosts (maybe not necessary for single container).
2. You run 'rs.initiate()' to start a single container replica set in
   run_docker_compose.sh.
