const { gql } = require("apollo-server-express");

// CWE-213: Excessive Data Exposure — the User type exposes passwordHash over
// GraphQL; nothing in the resolver strips it before returning the row.
const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    bio: String
    passwordHash: String
  }

  type Query {
    user(id: ID!): User
    users: [User!]!
  }

  input UserInput {
    email: String
    bio: String
    role: String
  }

  type Mutation {
    updateUser(id: ID!, input: UserInput!): User
  }
`;

module.exports = typeDefs;
