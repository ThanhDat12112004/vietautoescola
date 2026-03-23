require('dotenv').config({ path: process.env.ENV_FILE || '.env' });

const app = require('./app');

const port = Number(process.env.MATERIALS_SERVICE_PORT);

if (!port) {
  throw new Error('Missing MATERIALS_SERVICE_PORT in environment');
}

app.listen(port, () => {
  console.log(`materials-service listening on port ${port}`);
});
