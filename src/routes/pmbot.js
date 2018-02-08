var log = require('osg-logger').of('routes/pmbot'),
	express = require('express')
    ;

module.exports = function (controller, middlewares) {

	var router = express.Router();

	router.get('/status', function (req, res) {
		res.status(200);
		res.json({ e: 200, r: Date.now() });
	});

	router.post('/github', function (req, res) {
		res.status(200);
		res.json({ e: 200, r: Date.now() });
	});

	return router;
};


log.info('module loaded');