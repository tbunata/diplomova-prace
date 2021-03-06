import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import Express from "express";
import http from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";

import { buildSchema } from "type-graphql";
import { verifyToken } from "./auth/auth-middleware";
import { authChecker } from "./auth/auth-checker";

import { PrismaClient } from "@prisma/client";
import { CartResolver } from "./resolvers/Carts";
import { CategoryResolver } from "./resolvers/Categories";
import { OrderResolver } from "./resolvers/Orders";
import { ProductResolver } from "./resolvers/Products";
import { UserResolver } from "./resolvers/Users";

export const prisma = new PrismaClient();

export const createApp = async () => {
  const app = Express();
  app.use(Express.json());
  app.use(verifyToken);
  const httpServer = http.createServer(app);

  const schema = await buildSchema({
    resolvers: [CartResolver, CategoryResolver, OrderResolver, ProductResolver, UserResolver],
    authChecker: authChecker,
    dateScalarMode: "isoDate",
    emitSchemaFile: true,
    validate: false,
  });

  const subscriptionServer = SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: "/graphql" }
  );

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
    context: ({ req }) => {
      const context = {
        req,
        user: req.user,
      };
      return context;
    },
  });

  await server.start();
  server.applyMiddleware({ app });
  return httpServer;
};
