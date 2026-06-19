# nooget

nooget is a GitHub-first scaffolding CLI for cloning a repository into a local folder without keeping Git history in the final destination.

## What This Package Does

`nooget` helps you bootstrap projects from template repositories.

- Clones a template repository into a temporary directory.
- Copies template files into your target folder without `.git` history.
- If a `plopfile` is present, runs Plop to scaffold files.
- Forwards template arguments to Plop (preferably using `--`).

Typical flow:

1. Resolve template repository URL.
2. Clone into a temporary folder.
3. Copy files to destination and remove `.git`.
4. Run Plop in destination when a `plopfile` exists.
5. Clean up temporary files.

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
nooget <repo> [target-dir] [--ref <branch>] [--force] [-- <plop-args...>]
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
nooget my-org/template my-app -- --name api --service users
```

## What It Does

When you run `nooget`, it:

1. Resolves the GitHub repository input into an HTTPS Git URL.
2. Clones the requested branch into a temporary directory.
3. Copies the working tree into your destination folder.
4. Excludes `.git` from the final copied output.
5. If a `plopfile` exists in the cloned template, runs Plop in the destination.
6. Removes the temporary directory.

The destination folder should contain the repository files, but not the Git history.

Plop arguments can be forwarded in two ways:

- Preferred: pass arguments after `--`; they are forwarded unchanged.
- Fallback: when `--` is not used, unknown trailing arguments are forwarded to Plop.

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