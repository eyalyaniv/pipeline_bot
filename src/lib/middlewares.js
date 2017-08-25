var log = require('osg-logger').of('lib/middlewares')
    ;

module.exports = function (config) {
    var cw = require('osg-cw')(config)
        ;
    return {
        cw: cw
    };
};


log.info('module loded');