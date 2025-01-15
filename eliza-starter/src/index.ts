import { DirectClient } from "@elizaos/client-direct";
import {
  AgentRuntime,
  elizaLogger,
  settings,
  stringToUuid,
  type Character,
} from "@elizaos/core";
import { bootstrapPlugin } from "@elizaos/plugin-bootstrap";
import { createNodePlugin } from "@elizaos/plugin-node";
import { solanaPlugin } from "@elizaos/plugin-solana";
import fs from "fs";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { initializeDbCache } from "./cache/index.ts";
import { startChat } from "./chat/index.ts";
import { initializeClients } from "./clients/index.ts";
import { getTokenForProvider, loadCharacters } from "./config/index.ts";
import { initializeDatabase } from "./database/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const wait = (minTime: number = 1000, maxTime: number = 3000) => {
  const waitTime =
    Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
  return new Promise((resolve) => setTimeout(resolve, waitTime));
};

let nodePlugin: any | undefined;

export function createAgent(
  character: Character,
  db: any,
  cache: any,
  token: string,
) {
  elizaLogger.success(
    elizaLogger.successesTitle,
    "Creating runtime for character",
    character.name,
  );

  nodePlugin ??= createNodePlugin();

  return new AgentRuntime({
    databaseAdapter: db,
    token,
    modelProvider: character.modelProvider,
    evaluators: [],
    character,
    plugins: [
      bootstrapPlugin,
      nodePlugin,
      character.settings?.secrets?.WALLET_PUBLIC_KEY ? solanaPlugin : null,
    ].filter(Boolean),
    providers: [],
    actions: [],
    services: [],
    managers: [],
    cacheManager: cache,
  });
}

async function startAgent(character: Character, directClient: DirectClient) {
  try {
    character.id ??= stringToUuid(character.name);
    character.username ??= character.name;

    const token = getTokenForProvider(character.modelProvider, character);
    const dataDir = path.join(__dirname, "../data");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const db = initializeDatabase(dataDir);

    await db.init();

    const cache = initializeDbCache(character, db);
    const runtime = createAgent(character, db, cache, token);

    await runtime.initialize();

    runtime.clients = await initializeClients(character, runtime);

    directClient.registerAgent(runtime);

    // report to console
    elizaLogger.debug(`Started ${character.name} as ${runtime.agentId}`);

    return runtime;
  } catch (error) {
    elizaLogger.error(
      `Error starting agent for character ${character.name}:`,
      error,
    );
    console.error(`Failed to start agent for character: ${character.name}`);
    process.exit(1); // Exit on failure
  }
}

const checkPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        resolve(true);
      }
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "0.0.0.0");
  });
};

const startAgents = async () => {
  const rawArgs = process.argv.slice(2);
  let charactersArg: string | undefined;

  for (const arg of rawArgs) {
    if (arg.startsWith("--characters=")) {
      charactersArg = arg.split("=")[1];
      break;
    }
    if (arg.startsWith("--character=")) {
      charactersArg = arg.split("=")[1];
      break;
    }
  }

  if (!charactersArg) {
    console.error("Error: No --character or --characters argument provided.");
    process.exit(1);
  }

  let characters;
  try {
    characters = await loadCharacters(charactersArg);
    console.log(
      "Loaded characters:",
      characters.map((c) => c.name),
    );
  } catch (error) {
    console.error("Failed to load characters:", error);
    process.exit(1);
  }

  try {
    for (const character of characters) {
      const db = initializeDatabase(path.join(__dirname, "../data"));
      await db.init();
      const cache = initializeDbCache(character, db);
      const token = getTokenForProvider(character.modelProvider, character);
      const runtime = createAgent(character, db, cache, token);
      await runtime.initialize();
      runtime.clients = await initializeClients(character, runtime);
    }
    elizaLogger.log("All agents started successfully");
  } catch (error) {
    elizaLogger.error("Error starting agents:", error);
    process.exit(1);
  }
};

startAgents().catch((error) => {
  elizaLogger.error("Unhandled error in startAgents:", error);
  process.exit(1); // Exit on unhandled errors
});
