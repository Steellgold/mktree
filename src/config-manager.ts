import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export type ConfigScope = "global" | "project";

export interface MktreeConfig {
  version: string;
  exclusions: string[];
  scope: ConfigScope;
}

export const DEFAULT_EXCLUSIONS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "android",
  "ios",
  ".expo",
  ".gradle",
  ".next",
  ".nuxt",
  "coverage",
  "__pycache__",
  ".cache",
  ".tmp",
  ".temp",
  ".env",
  ".vscode",
  ".idea",
  ".DS_Store",
  "Thumbs.db",
  ".turbo",
  ".vite",
  ".svelte-kit",
  "vendor",
  "target",
  "bin",
  "obj",
  ".pytest_cache",
  ".next",
  "out",
  ".output",
];

export const CONFIG_FILENAME = ".mktree.json";
export const GLOBAL_CONFIG_FILENAME = ".mktree.json";

export class ConfigManager {
  private globalConfigPath: string;

  constructor() {
    this.globalConfigPath = path.join(os.homedir(), ".config", "mktree", GLOBAL_CONFIG_FILENAME);
  }

  getGlobalConfig(): MktreeConfig | null {
    try {
      if (fs.existsSync(this.globalConfigPath)) {
        const content = fs.readFileSync(this.globalConfigPath, "utf-8");
        return JSON.parse(content);
      }
    } catch {
      return null;
    }
    return null;
  }

  setGlobalConfig(config: MktreeConfig): void {
    const dir = path.dirname(this.globalConfigPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.globalConfigPath, JSON.stringify(config, null, 2), "utf-8");
  }

  getProjectConfig(projectPath: string): MktreeConfig | null {
    try {
      const configPath = path.join(projectPath, CONFIG_FILENAME);
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, "utf-8");
        return JSON.parse(content);
      }
    } catch {
      return null;
    }
    return null;
  }

  setProjectConfig(projectPath: string, config: MktreeConfig): void {
    const configPath = path.join(projectPath, CONFIG_FILENAME);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
  }

  getMergedExclusions(projectPath?: string): string[] {
    let exclusions: string[] = [];

    const projectConfig = projectPath ? this.getProjectConfig(projectPath) : null;
    const globalConfig = this.getGlobalConfig();

    if (projectConfig && projectConfig.scope === "project") {
      exclusions = projectConfig.exclusions;
    } else if (globalConfig && globalConfig.scope === "global") {
      exclusions = globalConfig.exclusions;
    } else {
      exclusions = [...DEFAULT_EXCLUSIONS];
    }

    return exclusions;
  }

  hasProjectConfig(projectPath: string): boolean {
    const configPath = path.join(projectPath, CONFIG_FILENAME);
    return fs.existsSync(configPath);
  }

  removeProjectConfig(projectPath: string): void {
    const configPath = path.join(projectPath, CONFIG_FILENAME);
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  }
}
