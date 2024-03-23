import ncu from "npm-check-updates";
import glob from "glob";
import { resolve } from "path";

const shouldUpgrade =
  process.argv.includes("--upgrade") || process.argv.includes("-u");

const checkForUpdates = async (path: string) => {
  const filePaths = glob.sync(resolve(path, "**/package.json"), {
    ignore: "**/node_modules/**",
  });

  for (const filePath of filePaths) {
    try {
      const upgraded = await ncu({
        packageFile: filePath,
        filter: "/^@react-(aria|stately|types)\\/.*$/",
        upgrade: shouldUpgrade,
        jsonUpgraded: false,
      });
      console.log(`Upgrades for ${filePath}:`, upgraded);

      if (shouldUpgrade && upgraded) {
        console.log(`✅ Upgraded packages in ${filePath}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Error occurred while checking for updates in ${filePath}:`,
          error.message
        );
      } else {
        console.error(`An unexpected error occurred in ${filePath}:`, error);
      }
    }
  }
};

const main = async () => {
  const dirs = [resolve("app/web"), resolve("packages")];
  for (const dir of dirs) {
    await checkForUpdates(dir);
  }
};

main();
