const express = require('express')
const bodyParser = require('body-parser')
const T = require('./api')
const app = express()
const port = process.PORT || 3000
app.use(bodyParser.urlencoded({ extended: true }))

const router = express.Router()
router.post('/test/get', T.get)
router.post('/test/set', T.set)
router.post('/test/destroy', T.destroy)

app.use(router)
app.listen(port)

console.log('http server started on port: ' + port)
