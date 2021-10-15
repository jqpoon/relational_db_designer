var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (process.env.NODE_ENV === "production") {
		app.use(express.static(path.join(__dirname, "..", "client", "build")));
		res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
	} else {
		app.use(express.static(path.join(__dirname, 'public')));
		res.render('index', { title: 'Express' });
	}
});

module.exports = router;
