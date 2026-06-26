import "dotenv/config";
import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";
import { logger } from "./utils";

const PORT = config.port;

async function main() {
  try {
    await prisma.$connect();
    logger.info("Connected to the database successfully.");
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error({ err: error }, "Error starting the server");
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
