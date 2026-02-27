import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        // Use DIRECT_URL for CLI operations (db push, db pull, generate)
        // This bypasses the connection pooler for DDL operations
        url: env("DIRECT_URL"),
    },
});
