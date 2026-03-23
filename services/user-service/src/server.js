const app = require('./app');
require('dotenv').config({ path: process.env.ENV_FILE || '.env' });

const port = Number(process.env.USER_SERVICE_PORT);

if (!port) {
  throw new Error('Missing USER_SERVICE_PORT in environment');
}

app.listen(port, () => {
  console.log(`user-service listening on port ${port}`);
});
