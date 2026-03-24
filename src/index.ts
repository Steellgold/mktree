#!/usr/bin/env node

import { Command } from "commander";
import type { TreeOptions } from "./config";
import { DEFAULT_OPTIONS } from "./config";
import { generateTree, outputToFile } from "./tree";
import { runExcludeCommand, showExcludeStatus } from "./exclude";
import { ConfigManager } from "./config-manager";

interface CliOptions {
  level: number | null;
  dirsOnly: boolean;
  exclude: string[];
  output: string | null;
  format: "txt" | "json";
  color: boolean;
  icons: boolean;
}

const program = new Command();

program
  .name("mktree")
  .description("Generate beautiful project tree structures from the command line")
  .version("1.0.0");

program
  .command("exclude")
  .description("Manage exclusion patterns")
  .action(async (options: { add?: boolean; status?: boolean }) => {
    const currentPath = process.cwd();

    await showExcludeStatus(currentPath);

    if (options.add) {
      await runExcludeCommand(currentPath);
    } else {
      console.log("   --add    Ajouter des exclusions\n");
    }
  })
  .option("-a, --add", "Ajouter de nouveaux patterns d'exclusion")
  .option("-s, --status", "Afficher le statut des exclusions (défaut)");

program
  .argument("[path]", "Path to the directory to tree", process.cwd())
  .option("-L, --level <number>", "Maximum depth to display", (val) =>
    val ? parseInt(val, 10) : null
  )
  .option("-d, --dirs-only", "Display directories only")
  .option(
    "-e, --exclude <patterns>",
    "Patterns to exclude (comma-separated or multiple -e)",
    (val) => val.split(",").map((s: string) => s.trim())
  )
  .option("-o, --output <file>", "Output to file instead of stdout")
  .option("-f, --format <type>", "Output format: txt or json", /^(txt|json)$/, "txt")
  .option("--no-color", "Disable colored output")
  .option("--icons", "Show icons next to files and folders")
  .action((path: string, options: CliOptions) => {
    const configManager = new ConfigManager();
    const projectExclusions = configManager.getMergedExclusions(path);

    const finalOptions: TreeOptions = {
      path: path || process.cwd(),
      level: options.level ?? DEFAULT_OPTIONS.level,
      dirsOnly: options.dirsOnly ?? DEFAULT_OPTIONS.dirsOnly,
      exclude:
        options.exclude && options.exclude.length > 0
          ? [...projectExclusions, ...options.exclude]
          : projectExclusions,
      showIcons: options.icons ?? DEFAULT_OPTIONS.showIcons,
      useColor: options.output ? false : (options.color ?? DEFAULT_OPTIONS.useColor),
      output: options.output ?? DEFAULT_OPTIONS.output,
      format: options.format ?? DEFAULT_OPTIONS.format,
    };

    const result = generateTree(finalOptions);

    if (finalOptions.output) {
      outputToFile(result.tree, finalOptions.output);
      console.log(`Tree written to ${finalOptions.output}`);
    } else {
      console.log(result.tree);
    }
  });

program.parse();
