import { Command } from "commander";
import { startCommand } from "./commands";

const program = new Command();

program
  .name("locl")
  .description("Locl is a local server that can expose your local server to the internet")
  .version("1.0.0");

program
  .command("start")
  .description("Start a local server")
  .option("-p, --port <number>", "Port to start the server on")
  .action((options) => {
    const port = options.port || 3000;
    startCommand(port);
  });

program.parse(process.argv);