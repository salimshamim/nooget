# nooget

nooget is a GitHub-first scaffolding CLI for cloning a repository into a local folder without keeping Git history in the final destination.

It is designed around a simple first version:

- GitHub over HTTPS only
- Works with `owner/repo` shorthand or full GitHub HTTPS URLs
- Uses `git clone` under the hood
- Copies files into the destination without preserving the `.git` directory
- Uses Node file system APIs for cleanup, which keeps the flow Windows-safe

## Requirements

- Node.js
- Git installed and available on `PATH`

## Install

For local development in this repo:

```bash
npm install
npm run build
npm run relink
```

That links the `nooget` command globally on your machine for testing.

## Usage

```bash
nooget <repo> [target-dir] [--ref <branch>] [--force]
```

Supported repo formats:

```bash
nooget owner/repo
nooget https://github.com/owner/repo.git
```

Examples:

```bash
nooget facebook/react
nooget facebook/react my-app
nooget facebook/react my-app --ref main
nooget https://github.com/facebook/react.git my-app
```

## What It Does

When you run `nooget`, it:

1. Resolves the GitHub repository input into an HTTPS Git URL.
2. Clones the requested branch into a temporary directory.
3. Copies the working tree into your destination folder.
4. Excludes `.git` from the final copied output.
5. Removes the temporary directory.

The destination folder should contain the repository files, but not the Git history.

## Options

### `--ref <branch>`

Clones a specific branch.

```bash
nooget owner/repo my-app --ref develop
```

Default: `main`

### `--force`

Allows copying into an existing destination.

This currently means existing files may be overwritten during copy. It does not fully reset the destination folder first.

```bash
nooget owner/repo my-app --force
```

## Notes

- This version is GitHub HTTPS first. Other hosts and auth flows can be added later.
- Private GitHub repositories still rely on your local Git authentication setup.
- If Git is already authenticated for GitHub on your machine, `nooget` reuses that flow.

## Development

Build the TypeScript source:

```bash
npm run build
```

Rebuild and relink the CLI:

```bash
npm run relink
```