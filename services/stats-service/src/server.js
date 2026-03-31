const path = require('path');
require('dotenv').config({
  path: process.env.ENV_FILE || path.resolve(__dirname, '../../../.env'),
});

const app = require('./app');

const port = Number(process.env.STATS_SERVICE_PORT);

if (!port) {
  throw new Error('Missing STATS_SERVICE_PORT in environment');
}

app.listen(port, () => {
  console.log(`stats-service listening on port ${port}`);
});
