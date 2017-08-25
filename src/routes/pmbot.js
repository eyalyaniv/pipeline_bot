var log = require('osg-logger').of('routes/pmbot'),
	express = require('express')
    ;

module.exports = function (controller, middlewares) {

	var router = express.Router();

	// router.get('/alive', function (req, res) {
	// 	res.json({ e: 0, r: Date.now() });
	// });

	return router;
};


log.info('module loaded');