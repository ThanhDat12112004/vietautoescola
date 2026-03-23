const app = require('./app');
require('dotenv').config({ path: process.env.ENV_FILE || '.env' });

const port = Number(process.env.MEDIA_SERVICE_PORT);

if (!port) {
  throw new Error('Missing MEDIA_SERVICE_PORT in environment');
}

app.listen(port, () => {
  console.log(`media-service listening on port ${port}`);
});
