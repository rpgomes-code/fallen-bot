import { config } from "dotenv";
import { join } from "path";
import { existsSync } from "fs";

console.log("Current working directory:", process.cwd());

const envPath = join(process.cwd(), ".env");
console.log("Looking for .env file at:", envPath);

if (!existsSync(envPath)) {
  console.error(".env file not found!");
  process.exit(1);
}

config();

const requiredVars = ["TOKEN", "CLIENT_ID", "GUILD_ID"];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
  } else {
    console.log(`${varName} is set`);
    // Print first few characters of the value to verify it's loaded
    console.log(
      `${varName} starts with: ${process.env[varName]?.substring(0, 4)}...`
    );
  }
}
