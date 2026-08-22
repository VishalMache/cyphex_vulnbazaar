const express = require("express");
const cors = require("cors");
const path = require("path");
const { ApolloServer } = require("apollo-server-express");
const { PORT } = require("./config");

const { router: authRouter } = require("./routes/auth");
const productsRouter = require("./routes/products");
const reviewsRouter = require("./routes/reviews");
const ordersRouter = require("./routes/orders");
const couponsRouter = require("./routes/coupons");
const adminRouter = require("./routes/admin");
const usersRouter = require("./routes/users");
const filesRouter = require("./routes/files");
const templatesRouter = require("./routes/templates");
const invoiceProxyRouter = require("./routes/invoice-proxy");
const chatRouter = require("./routes/chat");
const profileRouter = require("./routes/profile");

const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");

async function main() {
  const app = express();

  // CWE-942: Permissive CORS — reflects any origin, allowing any site to make
  // authenticated cross-origin requests against this API.
  app.use(cors({ origin: "*" }));

  app.use(express.json());
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  // RASP note (see project README): mounted globally like this, the shield can
  // block a bad request but can't resolve a file:line for it, since it runs
  // before any route handler. `cyphex onboard` normally mounts it per-route.
  // const cyphexRasp = require("./cyphex-rasp");
  // app.use(cyphexRasp({ blockMode: true }));

  app.use("/api/auth", authRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/coupons", couponsRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/users", usersRouter);
  app.use("/api", filesRouter);
  app.use("/api/admin", templatesRouter);
  app.use("/api/invoices", invoiceProxyRouter);
  app.use("/api/support", chatRouter);
  app.use("/profile", profileRouter);

  const apollo = new ApolloServer({ typeDefs, resolvers });
  await apollo.start();
  apollo.applyMiddleware({ app, path: "/graphql" });

  app.get("/health", (req, res) => res.json({ status: "ok" }));

  app.listen(PORT, () => {
    console.log(`VulnBazaar gateway listening on :${PORT} (GraphQL at /graphql)`);
  });
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
