import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import type { TreeNode, TreeOptions, TreeResult } from "./config";
import { shouldExclude } from "./utils";

export function buildTree(
  currentPath: string,
  options: TreeOptions,
  currentLevel: number = 0
): TreeNode | null {
  try {
    const stats = fs.statSync(currentPath);

    if (!stats.isDirectory()) {
      return null;
    }

    const name = path.basename(currentPath);
    const node: TreeNode = {
      name,
      path: currentPath,
      isDirectory: true,
      children: [],
    };

    if (options.level !== null && currentLevel >= options.level) {
      return node;
    }

    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    const filteredEntries = entries.filter((entry) => !shouldExclude(entry.name, options.exclude));

    filteredEntries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) {
        return -1;
      }
      if (!a.isDirectory() && b.isDirectory()) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });

    for (const entry of filteredEntries) {
      const entryPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        const childNode = buildTree(entryPath, options, currentLevel + 1);
        if (childNode) {
          node.children!.push(childNode);
        }
      } else if (!options.dirsOnly) {
        node.children!.push({
          name: entry.name,
          path: entryPath,
          isDirectory: false,
        });
      }
    }

    return node;
  } catch {
    return null;
  }
}

function formatNodeName(name: string, isDirectory: boolean, useColor: boolean): string {
  if (useColor) {
    return isDirectory ? chalk.blueBright(name) : chalk.white(name);
  }
  return name;
}

function renderTreeInternal(
  node: TreeNode,
  prefix: string,
  isLast: boolean,
  isRoot: boolean,
  useColor: boolean
): string[] {
  const lines: string[] = [];

  if (!isRoot) {
    const connector = isLast ? "└── " : "├── ";
    lines.push(prefix + connector + formatNodeName(node.name, node.isDirectory, useColor));
  }

  if (node.children && node.children.length > 0) {
    const childPrefix = prefix + (isRoot ? "" : isLast ? "    " : "│   ");

    node.children.forEach((child, index) => {
      const isLastChild = index === node.children!.length - 1;
      const childLines = renderTreeInternal(child, childPrefix, isLastChild, false, useColor);
      lines.push(...childLines);
    });
  }

  return lines;
}

export function renderTree(
  node: TreeNode,
  options: TreeOptions,
  prefix: string = "",
  isLast: boolean = true,
  isRoot: boolean = true
): string[] {
  return renderTreeInternal(node, prefix, isLast, isRoot, options.useColor);
}

export function generateTree(options: TreeOptions): TreeResult {
  const targetPath = options.path || process.cwd();
  const rootNode = buildTree(targetPath, options);

  if (!rootNode) {
    return {
      tree: `Error: Cannot read directory "${targetPath}"`,
      stats: { files: 0, directories: 0, total: 0 },
    };
  }

  const flatOutput = renderTreeInternal(rootNode, "", true, true, options.useColor);
  const header = options.useColor
    ? chalk.bold(`\n📂 ${rootNode.name}\n`)
    : `\n📂 ${rootNode.name}\n`;
  const treeLines = flatOutput.join("\n");

  const tree = header + treeLines;

  const stats = countNodes(rootNode);
  const footer = options.useColor
    ? chalk.gray(`\n${stats.directories} directories, ${stats.files} files\n`)
    : `\n${stats.directories} directories, ${stats.files} files\n`;

  return {
    tree: tree + footer,
    stats,
  };
}

function countNodes(node: TreeNode): { files: number; directories: number; total: number } {
  let files = 0;
  let directories = 0;

  if (node.isDirectory) {
    directories++;
  } else {
    files++;
  }

  if (node.children) {
    for (const child of node.children) {
      const childStats = countNodes(child);
      files += childStats.files;
      directories += childStats.directories;
    }
  }

  return { files, directories, total: files + directories };
}

export function outputToFile(content: string, filePath: string): void {
  fs.writeFileSync(filePath, content, "utf-8");
}
