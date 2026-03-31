const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({
  path: process.env.ENV_FILE || path.resolve(__dirname, '../../../../.env'),
});

const { MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

if (!MYSQL_HOST || !MYSQL_PORT || !MYSQL_USER || !MYSQL_PASSWORD || !MYSQL_DATABASE) {
  throw new Error('Missing MySQL environment variables');
}

const pool = mysql.createPool({
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT),
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  connectionLimit: 10,
  namedPlaceholders: true,
});

module.exports = pool;
