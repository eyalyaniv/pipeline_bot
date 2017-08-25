
var logger = require("osg-logger"),
    config = require("osg-config-agent").get("pmbot.config")
    ;

logger.configure(config.loggers);

var log = logger.of("index"),
    webapp = require('express')(),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    vercheck = require('osg-vercheck'),
    manager = require('./lib/manager'),
    bi = require("./lib/bi"),
    middlewares = require("./lib/middlewares")(config),
    controllerLocator = require('./controller/locator'),
    dalLocator = require('./dal/locator'),
    routesLocator = require('./routes/locator')
    ;

webapp.use(cookieParser());
webapp.use(bodyParser.json());
webapp.use(bodyParser.urlencoded({ extended: false }));

var app = { config: config, middlewares: middlewares, routes: routesLocator, dal: dalLocator };
manager(
    app,
    {
        pmbot: require('./controller/pmbot')
    }
    , function (err, context) {
        if (err) {
            log.fatal('service error...shuting down');
            return process.exit(1);
        }

        webapp.use('/pmbot', context.pmbot.routes);

        vercheck.route(webapp);

        /*var server = */webapp.listen(config.app.port, function (err) {
            log.info('web server listen on port [%s]', config.app.port);
        });
    });

process.on('uncaughtException', function (err) {
    log.fatal(err);
});

