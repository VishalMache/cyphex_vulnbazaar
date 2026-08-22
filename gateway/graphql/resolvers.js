const pool = require("../db/postgres");

// CWE-639: IDOR — no context.user check; any caller can query any user by id,
// GraphQL's flexible field selection makes it trivial to also pull passwordHash.
// CWE-915: Mass Assignment — updateUser writes every field in `input` straight
// into the row, including `role`, with no allow-list and no ownership check.
const resolvers = {
  Query: {
    user: async (_, { id }) => {
      const result = await pool.query(
        "SELECT id, username, email, role, bio, password_hash AS \"passwordHash\" FROM users WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    },
    users: async () => {
      const result = await pool.query(
        'SELECT id, username, email, role, bio, password_hash AS "passwordHash" FROM users ORDER BY id'
      );
      return result.rows;
    },
  },
  Mutation: {
    updateUser: async (_, { id, input }) => {
      const columns = Object.keys(input);
      if (columns.length === 0) return null;
      const setClause = columns.map((c, i) => `${c} = $${i + 1}`).join(", ");
      const values = columns.map((c) => input[c]);
      values.push(id);
      const query = `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING id, username, email, role, bio, password_hash AS "passwordHash"`;
      const result = await pool.query(query, values);
      return result.rows[0];
    },
  },
};

module.exports = resolvers;
