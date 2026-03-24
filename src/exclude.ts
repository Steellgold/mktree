import enquirer from "enquirer";
import type { MktreeConfig } from "./config-manager";
import { ConfigManager, DEFAULT_EXCLUSIONS, CONFIG_FILENAME } from "./config-manager";

const { prompt } = enquirer;

export async function runExcludeCommand(projectPath: string): Promise<void> {
  const configManager = new ConfigManager();

  console.log("\n📁 mktree exclusion configuration\n");

  const existingGlobal = configManager.getGlobalConfig();
  const existingProject = configManager.getProjectConfig(projectPath);

  const currentExclusions =
    existingProject?.scope === "project"
      ? existingProject.exclusions
      : existingGlobal?.exclusions || DEFAULT_EXCLUSIONS;

  const customAnswer: any = await prompt({
    type: "input",
    name: "customPatterns",
    message: "Enter custom patterns to add (comma-separated, leave empty to skip):",
  } as any);

  let customPatterns: string[] = [];
  if (customAnswer.customPatterns && customAnswer.customPatterns.trim().length > 0) {
    customPatterns = customAnswer.customPatterns
      .split(",")
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);
  }

  const savedCustomPatterns = currentExclusions.filter(
    (p: string) => !DEFAULT_EXCLUSIONS.includes(p)
  );
  const allPatterns = [
    ...new Set([...savedCustomPatterns, ...customPatterns, ...DEFAULT_EXCLUSIONS]),
  ];

  const customChoicesList = allPatterns.filter((p: string) => !DEFAULT_EXCLUSIONS.includes(p));
  const defaultChoicesList = DEFAULT_EXCLUSIONS;

  const choices: any[] = [];
  if (customChoicesList.length > 0) {
    choices.push({ name: "─────────────", message: "Custom", disabled: true });
    choices.push(
      ...customChoicesList.map((item: string) => ({
        name: item,
        message: item,
        enabled: currentExclusions.includes(item),
      }))
    );
  }
  choices.push({ name: "─────────────", message: "Defaults", disabled: true });
  choices.push(
    ...defaultChoicesList.map((item: string) => ({
      name: item,
      message: item,
      enabled: currentExclusions.includes(item),
    }))
  );

  const answers: any = await prompt({
    type: "multiselect",
    name: "selections",
    message: "Select patterns to exclude:",
    choices,
  } as any);

  if (!answers.selections || answers.selections.length === 0) {
    console.log("\n⚠️  No pattern selected. Cancelled.\n");
    return;
  }

  const scopeAnswer: any = await prompt({
    type: "select",
    name: "scope",
    message: "Where do you want to save this configuration?",
    choices: [
      { name: "global", message: "Globally (for all projects)" },
      { name: "project", message: "Only for this project" },
    ],
    initial: existingProject?.scope === "project" ? 1 : 0,
  } as any);

  const config: MktreeConfig = {
    version: "1.0.0",
    exclusions: answers.selections,
    scope: scopeAnswer.scope,
  };

  if (scopeAnswer.scope === "global") {
    configManager.setGlobalConfig(config);
    console.log("\n✅ Configuration saved globally!");
    console.log(`   File: ~/.config/mktree/${CONFIG_FILENAME}\n`);
  } else {
    configManager.setProjectConfig(projectPath, config);
    console.log("\n✅ Configuration saved for this project!");
    console.log(`   File: ./${CONFIG_FILENAME}\n`);
  }

  console.log(
    `   Excluded patterns (${answers.selections.length}): ${answers.selections.join(", ")}\n`
  );
}

export async function showExcludeStatus(projectPath: string): Promise<void> {
  const configManager = new ConfigManager();

  const globalConfig = configManager.getGlobalConfig();
  const projectConfig = configManager.getProjectConfig(projectPath);

  console.log("\n📁 mktree exclusion status\n");

  if (projectConfig) {
    console.log(`✅ Project config active (./${CONFIG_FILENAME})`);
    console.log(`   Patterns: ${projectConfig.exclusions.join(", ")}`);
    console.log(`   Scope: Project\n`);
  } else if (globalConfig) {
    console.log(`✅ Global config active`);
    console.log(`   Patterns: ${globalConfig.exclusions.join(", ")}`);
    console.log(`   Scope: Global\n`);
  } else {
    console.log("📝 Using default configuration");
    console.log(`   Patterns: ${DEFAULT_EXCLUSIONS.join(", ")}\n`);
  }
}
