# mktree

Generate beautiful project tree structures from the command line.

## Installation

```bash
npm install -g @steellgold/mktree
```

## Usage

```bash
mktree [path] [options]
```

### Options

| Option | Description |
|--------|-------------|
| `-L, --level <n>` | Maximum depth to display |
| `-d, --dirs-only` | Display directories only |
| `-e, --exclude <patterns>` | Patterns to exclude (comma-separated) |
| `-o, --output <file>` | Output to file instead of stdout |
| `-f, --format <txt\|json>` | Output format (default: txt) |
| `--no-color` | Disable colored output |
| `--icons` | Show icons next to files/folders |

### Examples

```bash
# Basic usage (current directory)
mktree

# Specific path
mktree ./src

# Limit depth
mktree -L 2

# Directories only
mktree -d

# Exclude patterns
mktree -e "node_modules,.git,dist"

# Export to file
mktree -o tree.txt
```

## Configuration

### Quick setup

```bash
mktree exclude --add
```

This opens an interactive wizard:
1. Select patterns to exclude (30+ presets available)
2. Choose scope: Global (all projects) or Project (current folder only)

### Exclude command

```bash
mktree exclude        # Show current exclusions
mktree exclude --add  # Add new exclusions
```

### Default exclusions

`node_modules`, `.git`, `dist`, `build`, `android`, `ios`, `.expo`, `.gradle`, `.next`, `.nuxt`, `coverage`, `__pycache__`, `.cache`, `.tmp`, `.temp`, `.env`, `.vscode`, `.idea`, `.DS_Store`, `Thumbs.db`, `.turbo`, `.vite`, `.svelte-kit`, `vendor`, `target`, `bin`, `obj`, `.pytest_cache`, `out`, `.output`

## License

MIT
