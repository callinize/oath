/*!
 * Oath - Node.js / browser event emitter.
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var Promise = require('bluebird').getNewLibraryCopy();
var exports = module.exports = Oath;
var util = require('util');

Promise.setScheduler(function(fn) {
  fn();
});

/*!
 * oath version
 */
exports.version = '0.2.3';

/**
 * # Oath constructor
 *
 * Create a new promise.
 *
 * #### Options
 *
 * * parent - used internally for chaining
 * * context - object to set as `this` in callbacks
 *
 * You can use `Oath` within single functions
 *
 *      // assignment style
 *      var promise = new oath();
 *      promise.then(successFn, errorFn);
 *      myAsycFunction(function(err, result) {
 *        if (err) promise.reject(err);
 *        promise.resolve(result);
 *      });
 *
 * Or return them to ease chaining of callbacks
 *
 *      // return style
 *      function doSomething(data) {
 *        var promise = new oath();
 *        // async stuff here
 *        // promise should be returned immediately
 *        return promise;
 *      }
 *
 *      doSomething(data).then(successFn, errorFn);
 *
 * @name constructor
 * @param {Object} options
 * @api public
 */

var oldThen = Promise.prototype.then;
Promise.prototype.then = function(onFullfill, onReject) {
  var newOnFullfill = onFullfill;
  if(onFullfill) {
    if(onFullfill.length === 2) { // for async functions
      newOnFullfill = function(val) {
        return new Promise(function(resolve, reject) {
          onFullfill(val, function(val) {
            resolve(val);
          });
        }, onReject);
      };
    } else if(onFullfill.length > 2) {
      throw new Error('Oath: Invalid function registered - to many parameters.');
    }
  }
  return oldThen.call(this, newOnFullfill, onReject, undefined, undefined, undefined);  
}

function Oath () {
  this.constructor = Promise;
  var self = this;
  Promise.call(this, function(resolve, reject) {
    self.resolve = resolve;
    self.reject = reject;
  });
  this.constructor = Oath;
  
  this.promise = this;
}

util.inherits(Oath, Promise);

Oath.prototype.node = function() {
  var self = this;
  if(arguments.length === 0) {
    return function(err, val) {
      if(err) return self.reject(err);
      return self.resolve(val);
    };
  } else {
    return this.asCallback.apply(this, arguments);
  }
}
