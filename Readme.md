**connect-restful** is a session store supported by [express-session](https://github.com/expressjs/session), to implement restful api call on any compatible session stores.

Setup
-----
```sh
npm install connect-restful express-session
```
example


```js
const session = require('express-session')
const restfulStore = require('connect-restful')(session)

app.use(session({
  secret: 'keyword',
  store: new restfulStore(options)
}))
```

Options
-------
the object takes three **REQUIRED** keys as by express-session's store requirement.

- `get`: a function that calls apis to get session from store.
  It will be called as get({ key:sid }), and it should resolve with the session from store.
- `set` a function that calls apis to set session in store.
  It will be called as set({ key:sid, value:session, expireTime:expiration }), and it should resolve with something truthy.
- `destroy` a function that calls apis to delete certain key from session.
  It will be called as destroy({key:sid}), and it should resolve with something truthy.

**NOTICE** that these functions should always return a Promise object.

The following additional params may be included:
-	`expireTime` session expiration in seconds. Defaults to session.maxAge (if set), or one day.
-	`prefix` Key prefix defaulting to "restful:"
