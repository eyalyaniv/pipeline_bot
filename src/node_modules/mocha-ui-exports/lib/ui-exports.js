/**

NOTE: this file uses mocha indentation standard, because we might submit it in pull-request

 */

/**
 * TDD-style interface:
 *
 *     exports.Array = {
 *       '#indexOf()': {
 *         'should return -1 when the value is not present': function(){
 *
 *         },
 *
 *         'should return the correct index when the value is present': function(){
 *
 *         }
 *       }
 *     };
 *
 */

 /**
 * Module dependencies.
 */
var Suite = require('mocha/lib/suite'),
    Test = require('mocha/lib/test'),
    strategyOf = {
      beforeAll : function(suite, fn, key) {
        fn.should.be.type('function', "suite.setup suite handler");
        suite.beforeAll(fn);
      },
      beforeEach: function(suite, fn, key) {
        fn.should.be.type('function', "suite.before suite handler");
        suite.beforeEach(fn);
      },
      afterEach: function(suite, fn, key) {
        fn.should.be.type('function', "suite.after suite handler");
        suite.afterEach(fn);
      },
      afterAll: function(suite, fn, key) {
        fn.should.be.type('function', "suite.teardown suite handler");
        suite.afterAll(fn);
      },
      timeout: function(suite, fn, key) {
        ['string','number'].should.include(typeof fn, "suite.timeout suite specifier should be string or number");
        suite.timeout(fn);
        if (isNaN(suite._timeout)) 
            throw new Error("wrong format in timeout specification: " + fn );
      }, 
      pend: function(suite, fn, key) {
        suite.pending = true;
        suite.tests.forEach( function(item) { item.pending = true } );
        suite.suites.forEach( strategyOf.pend );
      }
    }
  ;

strategyOf.skip = strategyOf.pend;
strategyOf.setup = strategyOf.beforeAll;
strategyOf.teardown = strategyOf.afterAll;
strategyOf.before = strategyOf.beforeEach;
strategyOf.after = strategyOf.afterEach;

module.exports = function(suite){
  var suites = [suite],
      should = require('should'),
      block  = require('./block');

  suite.on('require', visit);
  suite.on('pre-require', augment);

  function visit(obj) {
    var suite;
    for (var key in obj) {
      var fn = obj[key];

      //handle special keys
      if (strategyOf[key]) {
        strategyOf[key](suites[0], fn, key);
        continue;
      }
      
      //handle special values 
      switch(typeof fn) {
        case 'object': 
          if ( fn ) { 
            suite = Suite.create(suites[0], key); //inherits pending from parent in 1st arg
            suites.unshift(suite);
            visit(obj[key]);
            suites.shift();

            if (suite.tests.length || suite.suites.length) continue;

            //else - if no tests were added - add the suite as pending test
            suites[0].suites.pop();
          }

          //else - empty or null suite should be pending
          fn = null;
          break;
        case 'string' :
          key = key + " >> " + fn;
          fn = null;
          break;
        case 'function':
        default:
      }
      if (suites[0].pending) fn = null;
      suites[0].addTest(new Test(key, fn))
    }
  }

  function augment(context, file, mocha){
      context.block = block;
      context.Should = should;
  }
};