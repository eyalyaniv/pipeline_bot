var logger = require('osg-logger'),
    log = logger.of('lib/bi'),
    util = require('util'),
    strategy = {
        
    };

function event() {
    var args = Array.apply(Array, arguments);
    var category = args[0];
    if (!category || !strategy[category]) {
        log.error('%j', { message: 'required parametrs are missing', category: category });
        return;
    }
    args.splice(0, 1);
    var record = strategy[category].apply(null, args);
    if (record) logger.of(util.format('bi:%s', category)).info('%j', record);
}
module.exports.event = event;


log.info("module loaded");
