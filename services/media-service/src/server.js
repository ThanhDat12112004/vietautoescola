const path = require('path');
require('dotenv').config({
  path: process.env.ENV_FILE || path.resolve(__dirname, '../../../.env'),
});
const app = require('./app');

const port = Number(process.env.MEDIA_SERVICE_PORT);

if (!port) {
  throw new Error('Missing MEDIA_SERVICE_PORT in environment');
}

app.listen(port, () => {
  console.log(`media-service listening on port ${port}`);
});
