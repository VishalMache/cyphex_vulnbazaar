const { Pool } = require("pg");
const { PG_URL } = require("../config");

const pool = new Pool({ connectionString: PG_URL });

module.exports = pool;
