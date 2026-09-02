import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import mariadb from "mariadb";
import "dotenv/config";

const url = new URL(process.env.DATABASE_URL as string);
const pool = mariadb.createPool({
  host: url.hostname,
  port: parseInt(url.port || "3306", 10),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
});
// @ts-ignore
const adapter = new PrismaMariaDb(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
