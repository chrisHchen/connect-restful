const session = require('express-session')
const restfulStore = require('../')(session)
const expect = require('chai').expect
const http = require('http')
const uid = require('uid-safe').sync
const P = require('bluebird')
const querystring = require('querystring');
require('./index.js')

const fn = function(){}

const rtPromise = function(){
  return new Promise(function(r,j){r()})
}

function generateSessionId() {
  return uid(24);
}

function simplePost(postData, options) {
  return new Promise(function (resolve, reject){
    var req = http.request( options, function(res) {
      let data = Buffer.from('', 'utf8')
      res.on('data', function(chunk){
        chunk = !Buffer.isBuffer(chunk)
          ? Buffer.from(chunk, 'utf8')
          : chunk
        data += chunk
      })
      res.on('end', function(){
        resolve(data)
      })
    })
    req.on('error', (e) => {
      reject(e)
    })
    req.write(postData)
    req.end()
  })
}

const set = function({ key, value }){
  const postData = querystring.stringify({key, value})

  const options = {
    port: 3000,
    hostname: '127.0.0.1',
    method: 'POST',
    path:'/test/set',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  }
  return simplePost(postData, options)
}

const get = function({ key }){
  const postData = querystring.stringify({key})

  const options = {
    port: 3000,
    hostname: '127.0.0.1',
    method: 'POST',
    path:'/test/get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  }
  return simplePost(postData, options)
}

const destroy = function({ key }){
  const postData = querystring.stringify({key})

  const options = {
    port: 3000,
    hostname: '127.0.0.1',
    method: 'POST',
    path:'/test/destroy',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  }
  return simplePost(postData, options)
}


describe('Baisc:', function() {
  it('required args provied', function() {
    expect(function(){new restfulStore()}).to.throw(Error)
  })

  it('called as constructor', function() {
    expect(restfulStore).to.throw(Error)
  })

  it('arg not return Promise', function() {

    expect(function(){
      new restfulStore({
        get:rtPromise,
        set:fn,
        destroy:fn
      })
    }).to.throw(Error)
  })
})

describe('Default:', function(){
  it('default options', function() {
    const r = new restfulStore({
      get:rtPromise,
      set:rtPromise,
      destroy:rtPromise
    })
    expect(r.prefix).to.equal('restful:')
    expect(r.expireTime).to.equal(86400)
  })
})

describe('Store:', function(){
  it('lifecycle', function() {
    const r = new restfulStore({
      get:get,
      set:set,
      destroy:destroy
    })
    
    P.promisifyAll(r)
    const sid = generateSessionId()
    return r.setAsync( sid, { cookie: { maxAge: 2000 }, name: 'chenqh' })
    .then(function(rt){
      expect(rt).to.equal(JSON.stringify({isSuccess: true}))
      return r.getAsync( sid )
    })
    .then(function(rt){
      // console.log(rt)
      expect(rt).to.deep.equal({ isSuccess: true, value:{cookie: { maxAge: 2000 }, name: 'chenqh' }})
      return r.setAsync( sid, { cookie: { maxAge: undefined }, name: 'chenqh' })
    })
    .then(function(rt){
      expect(rt).to.equal(JSON.stringify({isSuccess: true}))
      return r.destroyAsync( sid )
    })
    .then(function(rt){
      expect(rt).to.equal(JSON.stringify({isSuccess: true}))
    })
  })
})
