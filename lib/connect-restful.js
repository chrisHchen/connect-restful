/**
 * Connect - restful
 * chrisHchen @ chenchris1986@163.com
 */

const noop = function () {}

/**
 * One day in seconds.
 */
const oneDay = 86400
const testKey = 'restful_O0' + new Date().getTime()
const testValue = JSON.stringify({ test_01: 'test0011' })

function getExpireTime(store, sess) {
  var maxAge = sess.cookie && sess.cookie.maxAge;
  return store.expireTime || (typeof maxAge === 'number' ?
    Math.floor(maxAge / 1000) :
    oneDay);
}

function isThenable (obj) {
  return obj && typeof obj['then'] == 'function';
}

function checkOptionValidate(option) {
  if (typeof option['get'] == 'function') {
    // console.log(option['get']({ key: testKey }))
    const P = option['get']({ key: testKey });
    if (!isThenable(P)) {
      throw new Error('get must be a function that returns a Promise Object.' + 'check function:' + option['get'])
    }
  }
  if (typeof option['set'] == 'function') {
    const P = option['set']({ key: testKey, value: testValue, expireTime: oneDay });
    if (!isThenable(P)) {
      throw new Error('set must be a function that returns a Promise Object.' + 'check function:' + option['set'])
    }
  }
  if (typeof option['destroy'] == 'function') {
    const P = option['destroy']({ key: testKey })
    if (!isThenable(P)) {
      throw new Error('destroy must be a function that returns a Promise Object.' + 'check function:' + option['destroy'])
    }
  }
}

module.exports = function (session) {

  const Store = session.Store

  class RestfulStore extends Store {

    constructor(options) {
      super()
      if (!(this instanceof RestfulStore)) {
        throw new TypeError('Cannot call RestfulStore constructor as a function')
      }
      if(!options || !options.get || !options.set || !options.destroy){
        throw new Error('one or more of the following three required keys is/are not provided :  get, set, destroy')
      }
      checkOptionValidate(options)
      options = options || {}
      this.prefix = options.prefix || 'restful:'

      delete options.prefix
      this.serializer = options.serializer || JSON
      this.getRestful = options.get
      this.setRestful = options.set
      this.destroyRestful = options.destroy

      this.expireTime = options.expireTime || oneDay
    }

    get(sid, fn) {
      if (!fn) fn = noop
      const psid = this.prefix + sid

      this.getRestful({
          key: psid
        })
        .then((sess) => {
          if (!sess) return fn()
          let result = ''
          sess = sess.toString()
          try {
            result = this.serializer.parse(sess)
          } catch (er) {
            return fn(er)
          }
          return fn(null, result)
        })
        .catch((er) => {
          return fn(er)
        })
    }

    set(sid, sess, fn) {
      const psid = this.prefix + sid
      if (!fn) fn = noop

      let jsess = ''
      try {
        jsess = this.serializer.stringify(sess)
      } catch (er) {
        return fn(er)
      }

      this.setRestful({
          key: psid,
          value: jsess,
          expireTime: getExpireTime(this, sess)
        })
        .then((rt) => {
          if (rt) return fn(null, rt)
          return fn(rt)
        })
        .catch((er) => {
          return fn(er)
        })
    }

    destroy(sid, fn) {
      /**
       * dangerous
       */
      if (Array.isArray(sid)) {
        sid.forEach((s) => {
          this.destroyRestful({
              key: this.prefix + s
            })
            .then((rt) => {
              if (rt) return fn();
              return fn(rt)
            })
            .catch((er) => {
              return fn(er)
            })
        });
      } else {
        this.destroyRestful({
            key: this.prefix + sid
          })
          .then((rt) => {
            if (rt) return fn(null, rt)
            return fn(rt)
          })
          .catch((er) => {
            return fn(er)
          });
      }
    }
  }

  return RestfulStore
}
