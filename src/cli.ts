import "dotenv/config";

import { runCli } from "./cli/app";
import { handleFatalError } from "./cli/runtime/errors";

runCli(process.argv).catch((err) => {
  handleFatalError(err, process.argv);
});
