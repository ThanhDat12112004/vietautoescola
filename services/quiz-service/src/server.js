const path = require('path');
require('dotenv').config({
  path: process.env.ENV_FILE || path.resolve(__dirname, '../../../.env'),
});
const app = require('./app');

const port = Number(process.env.QUIZ_SERVICE_PORT);

if (!port) {
  throw new Error('Missing QUIZ_SERVICE_PORT in environment');
}

app.listen(port, () => {
  console.log(`quiz-service listening on port ${port}`);
});
