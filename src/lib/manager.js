var log = require('osg-logger').of('lib/manager'),
    async = require('async')
    ;

module.exports = function(context, controllers, next) {

    var instances = {};
    context.controller = { of: of };
    var binded = {};
    Object.keys(controllers).map(function(name) {
        binded[name] = controllers[name].bind(null, context);
    });

    async.parallel(
        binded,
        function(err, context) {
            Object.keys(context).map(function(name) {
                instances[name] = context[name].api;
            });
            next(null, context);
        });

    function of(name) {
        return instances[name];
    }

};


log.info('module loaded');