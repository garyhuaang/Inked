import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations must run over Neon's DIRECT (unpooled) connection — DDL over
    // the pooler fails. The app itself uses the pooled DATABASE_URL at runtime.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
