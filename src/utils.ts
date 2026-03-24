import chalk from "chalk";
import type { TreeOptions } from "./config";

export const ICONS = {
  file: "📄",
  folder: "📁",
  folderOpen: "📂",
};

export function formatName(name: string, isDirectory: boolean, options: TreeOptions): string {
  let formatted = name;

  if (options.showIcons) {
    formatted = isDirectory ? `${ICONS.folder} ${formatted}` : `${ICONS.file} ${formatted}`;
  }

  if (options.useColor) {
    formatted = isDirectory ? chalk.blueBright(formatted) : chalk.white(formatted);
  }

  return formatted;
}

export function shouldExclude(name: string, excludePatterns: string[]): boolean {
  return excludePatterns.some((pattern) => {
    if (pattern.startsWith("*.")) {
      const ext = pattern.slice(2);
      return name.endsWith(ext);
    }
    if (pattern.startsWith(".")) {
      return name === pattern || name.startsWith(pattern);
    }
    return name === pattern;
  });
}

export function getDefaultPath(): string {
  return process.cwd();
}

export function formatSize(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
