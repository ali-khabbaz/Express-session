var express = require('./server/requires.js').express,
	app = require('./server/requires.js').app,
	c = require('./server/requires.js').c,
	cluster = require('./server/requires.js').cluster,
	logger = require('./server/requires.js').logger,
	path = require('./server/requires.js').path,
	bodyParser = require('./server/requires.js').bodyParser,
	cookieParser = require('./server/requires.js').cookieParser,
	decode = require('./server/utilities.js').decode,
	numCPUs = require('./server/requires.js').numCPUs,
	request = require('./server/requires.js').request,
	showDb = require('./server/utilities.js').showDb;


var PORT = 80;
c.connect({
	host: '127.0.0.1',
	user: 'root',
	password: 'bahbah',
	db: 'test_01'
});


if (cluster.isMaster) {
	// Fork workers.
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
	cluster.on('exit', function (worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
	});
} else {
	// Workers can share any TCP connection
	// In this case its a HTTP server
	app.set('views', __dirname + '/public/views');
	app.set('view engine', 'ejs');
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded());
	app.use(cookieParser());
	app.use(session({
		cookieName: 'session',
		secret: 'aliIiIiIiIiIiIi',
		duration: 30 * 60 * 1000,
		activeDuration: 5 * 60 * 1000,
	}));
	app.use(
		express.static(path.join(__dirname, '/public'))
	);



	/*
	#1:Retrieve User Data from the Session
	app.get('/dashboard', function (req, res) {
		if (req.session && req.session.user) { // Check if session exists
			// lookup the user in the DB by pulling their email from the session
			User.findOne({
				email: req.session.user.email
			}, function (err, user) {
				if (!user) {
					// if the user isn't found in the DB, reset the session info and
					// redirect the user to the login page
					req.session.reset();
					res.redirect('/login');
				} else {
					// expose the user to the template
					res.locals.user = user;

					// render the dashboard page
					res.render('dashboard.jade');
				}
			});
		} else {
			res.redirect('/login');
		}
	});*/

	/*
	#2:Session Middleware

	That approach works fine for a few pages,
	 but you probably don’t want to rewrite the session logic for every single route
	 in a more substantial app. Instead, make it into a global middleware function.
	app.use(function (req, res, next) {
		if (req.session && req.session.user) {
			User.findOne({
				email: req.session.user.email
			}, function (err, user) {
				if (user) {
					req.user = user;
					delete req.user.password; // delete the password from the session it may be wrong
					delete req.session.password; //The password might be encrypted in the session,
					 but that’s still no reason to leave it in the cookie. Go ahead and delete it!
					req.session.user = user; //refresh the session value
					res.locals.user = user;
				}
				// finishing processing the middleware and run the route
				next();
			});
			//find user and next();
		} else {
			next();
		}
	});*/


	/*
	#3:we still need a middleware function that will check if the user is logged in
	 and redirect them if not.

	function requireLogin (req, res, next) {
		if (!req.user) {
			res.redirect('/login');
		} else {
			next();
		}
	};
	app.get('/dashboard', requireLogin, function(req, res) {
		res.render('dashboard.jade');
	});

	*/


	/*
	#4:There are a few more steps to properly secure the session.
	The first is simply to make sure your app resets the session when a user logs out.

	app.get('/logout', function(req, res) {
		req.session.reset();
		res.redirect('/');
	});

	*/

	/*

	HTTP/1.1 200 OK
	Content-Encoding: gzip
	Content-Language: en-US
	Content-Type: text/html;charset=UTF-8
	Date: Tue, 07 Jul 2015 12:18:02 GMT
	Server: Apache
	Set-Cookie: rememberMe=deleteMe; Path=/; Max-Age=0; Expires=Mon, 06-Jul-2015 12:18:03 GMT
	Set-Cookie: tenantNameKey=deleteMe; Path=/; Max-Age=0; Expires=Mon, 06-Jul-2015 12:18:03 GMT; Secure
	Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
	Vary: Accept-Encoding
	Content-Length: 2869
	Connection: keep-alive
	*/



	var registerFunction = require('./server/apps/register.js').register;
	var login = require('./server/apps/login.js').login;
	var global = require('./server/apps/global.js').global;
	var pdfServe = require('./server/apps/pdfServe.js').pdfServe;
	var jobs = require('./server/apps/jobs.js').jobs;

	/*
	destroy session
	req.session.destroy(function (err) {
		if (err) {
			console.log(err);
		} else {
			res.redirect('/');
		}
	});


	 */



	app.get(/.pdf/, pdfServe);
	//app.post('/app/register', registerFunction);
	// app.post('/app/login', login);

	/*app.post('/app/google-auth', function (req, res) {
		var url = 'https://accounts.google.com/o/oauth2/token',
			api_url = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect',
			params = {
				"client_id": req.body.client_id,
				"code": req.body.code,
				"redirect_uri": req.body.redirect_uri,
				"grant_type": 'authorization_code',
				"client_secret": 'luhLc7grx54U1pp_7BeadJep'
			};

		request.post(url, {
			"json": true,
			"form": params
		}, function (err, response, token) {
			var access_token = token.access_token,
				headers = {
					"Authorization": 'Bearer ' + access_token
				};
			request.get({
				"url": api_url,
				"headers": headers,
				"json": true
			}, function (err_2, response_2, profile) {
				if (!profile.code) {
					profile.sub = +profile.sub;
					console.log('profile', profile);
					var query = "SELECT ID FROM users WHERE email = '" + profile.email + "' AND " +
						"google_id = '" + profile.sub + "' ";

					showDb(query).then(function (res_2) {
						if (!res_2.length) {
							console.log('creating user');
							query = "INSERT INTO users (google_id , email, gender, name, first_name , last_name " +
								",picture ,google_profile) VALUES ('" + profile.sub + "' , '" + profile.email + "', " +
								"'" + profile.gender + "', '" + profile.name + "', '" + profile.given_name + "' ," +
								"'" + profile.family_name + "', '" + profile.picture + "' , '" + profile.profile + "' )";
							console.log('queryyyyyyyy', query);
							showDb(query).then(function (res_3) {
								console.log('user created');
								showDb("SELECT email , ID FROM users WHERE email = '" + profile.email + "' AND " +
									"google_id = '" + profile.sub + "' ").then(function (result) {
									console.log('result is', result[0].ID);
									var token = createToken({
										"id": +result[0].ID
									}, req);
									res.send({
										user: profile.email,
										id: +result[0].ID,
										token: token
									});

								}).fail(function (err) {
									console.log('errrrrrrrrr is', err);
								});


							}).fail(function (err_3) {
								console.log('err_3', err_3);
							});
						} else {
							console.log('user existed', res_2);
							showDb("SELECT email , ID FROM users WHERE email = '" + profile.email + "' AND " +
								"google_id = '" + profile.sub + "' ").then(function (result) {
								console.log('result is', result[0].ID);
								var token = createToken({
									"id": +result[0].ID
								}, req);
								res.send({
									user: profile.email,
									id: +result[0].ID,
									token: token
								});

							}).fail(function (err) {
								console.log('errrrrrrrrr is', err);
							});
						}

					}).fail(function (err_1) {
						console.log('1', err_1);
						res.send('Errrrrrrrrrrrr : ', err);
					});
				}
			});
		});
	});*/

	app.post('/app/jobs', jobs);
	app.get('/', global);



	app.listen(PORT);
	console.log('listening on port', PORT);
}