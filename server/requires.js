(function () {
	var express = require('express'),
		env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
		app = express(),
		q = require('q'),
		redis   = require('redis'),
		request = require('request'),
		logger = require('morgan'),
		cookieParser = require('cookie-parser'),
		bodyParser = require('body-parser'),
		path = require('path'),
		cluster = require('cluster'),
		numCPUs = require('os').cpus().length,
		util = require('util'),
		session = require('client-sessions'),//1
		session_2 = require('express-session'),//2
		redis_store = require('connect-redis')(session_2),
		Client = require('mariasql'),
		c = new Client();


	exports.app = app;
	exports.express = express;
	exports.session = session;//1
	exports.session_2 = session_2;//2
	exports.redis = redis;//2
	exports.redis_store = redis_store;//2
	exports.q = q;
	exports.logger = logger;
	exports.cookieParser = cookieParser;
	exports.bodyParser = bodyParser;
	exports.path = path;
	exports.sess = sess;
	exports.cluster = cluster;
	exports.numCPUs = numCPUs;
	exports.util = util;
	exports.c = c;
	exports.request = request;

}());