const path = require('path');
require('dotenv').config({
  path: process.env.ENV_FILE || path.resolve(__dirname, '../../../.env'),
});
const app = require('./app');

const port = Number(process.env.USER_SERVICE_PORT);

if (!port) {
  throw new Error('Missing USER_SERVICE_PORT in environment');
}

app.listen(port, () => {
  console.log(`user-service listening on port ${port}`);
});
