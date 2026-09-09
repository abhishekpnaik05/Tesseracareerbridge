import { prisma } from "@tesseracareerbridge/database";

async function main() {
  const result = await prisma.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_name='AuthChallenge' AND column_name='attempts'`
  );
  console.log("Column check:", JSON.stringify(result));

  const result2 = await prisma.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_name='AuthChallenge' ORDER BY column_name`
  );
  console.log("All AuthChallenge columns:", JSON.stringify(result2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
