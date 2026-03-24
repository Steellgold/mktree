import inquirer from "inquirer";
import type { MktreeConfig } from "./config-manager";
import { ConfigManager, DEFAULT_EXCLUSIONS, CONFIG_FILENAME } from "./config-manager";

export async function runExcludeCommand(projectPath: string): Promise<void> {
  const configManager = new ConfigManager();

  console.log("\n📁 Configuration des exclusions mktree\n");

  const existingGlobal = configManager.getGlobalConfig();
  const existingProject = configManager.getProjectConfig(projectPath);

  const currentExclusions =
    existingProject?.scope === "project"
      ? existingProject.exclusions
      : existingGlobal?.exclusions || DEFAULT_EXCLUSIONS;

  const answers = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selections",
      message: "Sélectionnez les patterns à exclure:",
      choices: [
        ...DEFAULT_EXCLUSIONS.map((item) => ({
          name: item,
          checked: currentExclusions.includes(item),
        })),
        new inquirer.Separator("---"),
        {
          name: "__custom__",
          value: "__custom__",
        },
      ],
      pageSize: 20,
    },
  ]);

  if (answers.selections.includes("__custom__")) {
    const customAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "customPatterns",
        message: "Entrez les patterns personnalisés (séparés par virgules):",
        validate: (input) => input.trim().length > 0 || "Veuillez entrer au moins un pattern",
      },
    ]);

    const customPatterns = customAnswer.customPatterns
      .split(",")
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);

    answers.selections = [
      ...answers.selections.filter((s: string) => s !== "__custom__"),
      ...customPatterns,
    ];
  } else {
    answers.selections = answers.selections.filter((s: string) => s !== "__custom__");
  }

  if (answers.selections.length === 0) {
    console.log("\n⚠️  Aucun pattern sélectionné. Annulation.\n");
    return;
  }

  const scopeAnswer = await inquirer.prompt([
    {
      type: "list",
      name: "scope",
      message: "Où voulez-vous sauvegarder cette configuration?",
      choices: [
        {
          name: "Globalement (pour tous les projets)",
          value: "global",
          short: "Global",
        },
        {
          name: " Seulement pour ce projet",
          value: "project",
          short: "Projet",
        },
      ],
      default: existingProject?.scope === "project" ? "project" : "global",
    },
  ]);

  const config: MktreeConfig = {
    version: "1.0.0",
    exclusions: answers.selections,
    scope: scopeAnswer.scope,
  };

  if (scopeAnswer.scope === "global") {
    configManager.setGlobalConfig(config);
    console.log("\n✅ Configuration sauvegardée globalement!");
    console.log(`   Fichier: ~/.config/mktree/${CONFIG_FILENAME}\n`);
  } else {
    configManager.setProjectConfig(projectPath, config);
    console.log("\n✅ Configuration sauvegardée pour ce projet!");
    console.log(`   Fichier: ./${CONFIG_FILENAME}\n`);
  }

  console.log(
    `   Patterns exclus (${answers.selections.length}): ${answers.selections.join(", ")}\n`
  );
}

export async function showExcludeStatus(projectPath: string): Promise<void> {
  const configManager = new ConfigManager();

  const globalConfig = configManager.getGlobalConfig();
  const projectConfig = configManager.getProjectConfig(projectPath);

  console.log("\n📁 Statut des exclusions mktree\n");

  if (projectConfig) {
    console.log(`✅ Configuration projet active (./${CONFIG_FILENAME})`);
    console.log(`   Patterns: ${projectConfig.exclusions.join(", ")}`);
    console.log(`   Scope: Project\n`);
  } else if (globalConfig) {
    console.log(`✅ Configuration globale active`);
    console.log(`   Patterns: ${globalConfig.exclusions.join(", ")}`);
    console.log(`   Scope: Global\n`);
  } else {
    console.log("📝 Configuration par défaut utilisée");
    console.log(`   Patterns: ${DEFAULT_EXCLUSIONS.join(", ")}\n`);
  }
}
