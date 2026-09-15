import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var prismaUnavailable: boolean | undefined;
}

const base =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = base;

function isLocalDummyDb() {
  const url = process.env.DATABASE_URL || "";
  return /@(localhost|127\.0\.0\.1):54322\b/.test(url);
}

export const prisma = base.$extends({
  query: {
    async $allOperations({ query, args }) {
      if (isLocalDummyDb() || global.prismaUnavailable) {
        throw new Error("Database unavailable");
      }
      try {
        return await query(args);
      } catch (err) {
        global.prismaUnavailable = true;
        throw err;
      }
    },
  },
});
