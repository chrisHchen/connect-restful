/**
 * Connect - restful
 * chrisHchen @ chenchris1986@163.com
 */

const noop = function () {};

/**
 * One day in seconds.
 */
const oneDay = 86400;

function getExpireTime(store, sess) {
  var maxAge = sess.cookie.maxAge;
  return store.expireTime || (typeof maxAge === 'number'
    ? Math.floor(maxAge / 1000)
    : oneDay);
}

module.exports = function (session) {

  const Store = session.Store;

  class RestfulStore extends Store {

    constructor(options) {
      super();
      if (!(this instanceof RestfulStore)) {
        throw new TypeError('Cannot call RestfulStore constructor as a function');
      }
      options = options || {};
      this.prefix = options.prefix == null ?
        'restful:' :
        options.prefix;

      delete options.prefix;
      this.serializer = options.serializer || JSON;

      this.getRestful = options.get;
      this.setRestful = options.set;
      this.destroyRestful = options.destroy;
    }

    get(sid, fn) {
      if (!fn) fn = noop;
      const psid = this.prefix + sid;

      this.getRestful({
          key: psid
        })
        .then((sess) => {
          if (!sess) return fn();
          let result = '';
          sess = sess.toString();

          try {
            result = this.serializer.parse(sess);
          } catch (er) {
            return fn(er);
          }
          return fn(null, result);
        })
        .catch((er) => {
          return fn(er);
        });
    }

    set(sid, sess, fn){
      const psid = this.prefix + sid;
      if (!fn) fn = noop;

      let jsess = '';
      try {
        jsess = this.serializer.stringify(sess);
      }
      catch (er) {
        return fn(er);
      }

      this.setRestful({
        key:psid,
        value:jsess,
        expireTime: getExpireTime(this, sess)
      })
      .then((rt) => {
        if(rt) return fn()
        return fn(rt);
      })
      .catch((er)=>{
        return fn(er);
      })
    }

    destroy(sid, fn){
      /**
       * dangerous
       */
      if (Array.isArray(sid)) {
        sid.forEach((s) => {
          this.destroyRestful({
            key:this.prefix + s
          })
          .then((rt) => {
            if(rt) return fn();
            return fn(rt);
          })
          .catch((er) => {
            return fn(er);
          })
        });
      } else {
        this.destroyRestful({
          key:this.prefix + sid
        })
        .then((rt) => {
          if(rt) return fn();
          return fn(rt);
        })
        .catch((er) => {
          return fn(er);
        });
      }
    }
  }

  return RestfulStore
}
