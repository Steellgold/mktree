export interface TreeOptions {
  path: string;
  level: number | null;
  dirsOnly: boolean;
  exclude: string[];
  showIcons: boolean;
  useColor: boolean;
  output: string | null;
  format: "txt" | "json";
}

export const DEFAULT_OPTIONS: Omit<TreeOptions, "path"> = {
  level: null,
  dirsOnly: false,
  exclude: [
    "node_modules",
    ".git",
    ".svn",
    "dist",
    "build",
    ".next",
    "__pycache__",
    ".DS_Store",
    "Thumbs.db",
  ],
  showIcons: false,
  useColor: true,
  output: null,
  format: "txt",
};

export interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: TreeNode[];
}

export interface TreeResult {
  tree: string;
  stats: {
    files: number;
    directories: number;
    total: number;
  };
}
