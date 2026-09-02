import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: "postgresql://postgres.bqcklybzfsgdqzpoeerf:7DHMaxNhQGGJ4kDJ@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
  },
});