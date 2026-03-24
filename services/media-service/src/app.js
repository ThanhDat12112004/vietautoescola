const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const mediaRoute = require('./routes/modules/media.route');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const mediaStorageDir = process.env.MEDIA_STORAGE_DIR;

if (!mediaStorageDir) {
	throw new Error('Missing MEDIA_STORAGE_DIR in environment');
}

const app = express();

app.use(
	helmet({
		crossOriginResourcePolicy: { policy: 'cross-origin' },
		frameguard: false,
		contentSecurityPolicy: {
			directives: {
				frameAncestors: ["'self'", 'http://localhost:3000', 'http://127.0.0.1:3000'],
			},
		},
	})
);
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/media/static', express.static(path.resolve(mediaStorageDir)));

app.use('/media', mediaRoute);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
