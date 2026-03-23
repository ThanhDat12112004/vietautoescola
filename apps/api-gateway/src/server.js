require('dotenv').config({ path: process.env.ENV_FILE || '.env' });

const app = require('./app');

const port = Number(process.env.API_GATEWAY_PORT);

if (!port) {
  throw new Error('Missing API_GATEWAY_PORT in environment');
}

app.listen(port, () => {
  console.log(`api-gateway listening on port ${port}`);
});
