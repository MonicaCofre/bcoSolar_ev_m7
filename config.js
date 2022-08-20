const { Pool } = require("pg");


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'bancosolar',
  password: '1234',
  min: 3,
  max: 10,
  idleTimeoutMillis: 5000,       // tiempo de espera antes de botar
  connectionTimeoutMillis: 2000, // tiempo de espera para entrar
  port: 5432
});
module.exports = pool;