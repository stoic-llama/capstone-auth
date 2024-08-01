import http from "http";

import app from "./src/app.js";
import config from "./src/utils/config.js";
import logger from "./src/utils/log.js";
import mongoInit from "./src/models/init.js";
// import dependentHostsInit from "./src/models/dependentHostsInit.js";

const log = logger("server");
const server = http.createServer(app);

process.on("uncaughtException", (err) => {
  log.fatal({ err }, `Unhandled exception ${err}`);
  server.close();
  process.exit(1); // Terminate the process with a non-zero exit code
});

process.on("unhandledRejection", (reason) => {
  log.error(`Unhandled promise rejection: ${reason}`);
  process.exit(1); // Terminate the process with a non-zero exit code
});

const main = async () => {
  // await dependentHostsInit();
  await mongoInit(config.DATABASE_URL);
  log.info(`Listening on 0.0.0.0:${config.PORT}`);
  await server.listen(config.PORT, '0.0.0.0');
};

main();
