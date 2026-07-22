import { PrismaClient } from "@prisma/client";
import { fetchAllSources } from "../src/lib/fetch-news";

// Standalone news-aggregator run (same logic as the Admin → News "Fetch latest news"
// button). Usage: pnpm tsx scripts/fetch-news.ts   — honors DATABASE_URL.

const prisma = new PrismaClient();

fetchAllSources(prisma)
  .then((added) => console.log(`✔ Fetched ${added} new item${added === 1 ? "" : "s"}.`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
