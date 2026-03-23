const app = require('./app');
require('dotenv').config({ path: process.env.ENV_FILE || '.env' });

const port = Number(process.env.QUIZ_SERVICE_PORT);

if (!port) {
  throw new Error('Missing QUIZ_SERVICE_PORT in environment');
}

app.listen(port, () => {
  console.log(`quiz-service listening on port ${port}`);
});
