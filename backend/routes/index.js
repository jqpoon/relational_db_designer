var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (process.env.NODE_ENV === "production") {
		res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
	} else {
		res.render('index', { title: 'Express' });
	}
});

module.exports = router;
