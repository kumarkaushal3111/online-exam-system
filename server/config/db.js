const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "kk422101",
  host: "localhost",
  port: 5432,
  database: "online_exam",
});

module.exports = pool;