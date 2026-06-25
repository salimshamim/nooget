import { dirname, join, resolve } from "path";
import { mkdir, readdir, rm, stat, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { spawn } from "child_process";

export type ScaffoldOptions = {
    alias: string;
    generatorUrl: string;
    targetDir?: string;
    ref?: string;
    force?: boolean;
    plopArgs?: string[];
};

export async function runScaffold(options: ScaffoldOptions): Promise<void> {
    const ref = options.ref || "main";
    const explicitTargetDir = options.targetDir?.trim();
    const hasExplicitTargetDir = !!explicitTargetDir;
    const destination = resolve(
        hasExplicitTargetDir
            ? explicitTargetDir
            : process.cwd()
    );

    await ensureDestinationIsWritable(
        destination,
        !!options.force,
        hasExplicitTargetDir
            ? undefined
            : "This command must be run in an empty directory. Provide --target-dir for another location or use --force to continue."
    );

    const tempParent = await ensureTempParent(destination);
    const tempDir = join(tempParent, `.nooget-generator-temp-${Date.now()}`);

    try {
        await runGitClone({
            repoUrl: options.generatorUrl,
            ref,
            tempDir
        });

        const plopfilePath = await findPlopfile(tempDir);
        if (!plopfilePath) {
            throw new Error("Generator repo is missing plopfile.cjs/mjs/js");
        }

        await runPlopCommand({
            cwd: tempDir,
            plopfilePath,
            destination,
            plopArgs: options.plopArgs ?? []
        });
    } finally {
        await rm(tempDir, {
            recursive: true,
            force: true,
            maxRetries: 5,
            retryDelay: 200
        }).catch(() => {
            console.warn(`Warning: Failed to clean temp directory: ${tempDir}`);
        });
    }
}

async function ensureTempParent(destination: string): Promise<string> {
    const parent = dirname(destination);
    try {
        await mkdir(parent, { recursive: true });
        return parent;
    } catch {
        return tmpdir();
    }
}

async function ensureDestinationIsWritable(
    destination: string,
    force: boolean,
    nonEmptyErrorMessage?: string
): Promise<void> {
    try {
        const entries = await readdir(destination);
        if (entries.length > 0 && !force) {
            throw new Error(
                nonEmptyErrorMessage
                    || `Destination already exists and is not empty: ${destination}. Use --force to overwrite.`
            );
        }
    } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code === "ENOENT") {
            await mkdir(destination, { recursive: true });
        } else {
            throw error;
        }
    }

    const probePath = join(destination, `.nooget-write-test-${Date.now()}`);
    try {
        await writeFile(probePath, "");
        await rm(probePath, { force: true });
    } catch {
        throw new Error(`Destination is not writable: ${destination}`);

    }
}

async function findPlopfile(root: string): Promise<string | undefined> {
    const candidates = ["plopfile.cjs", "plopfile.mjs", "plopfile.js"];
    for (const file of candidates) {
        const p = join(root, file);
        try {
            const info = await stat(p);
            if (info.isFile()) {
                return p;
            }
        } catch {
            // ignore missing
        }
    }
    return undefined;
}

async function runGitClone(input: { repoUrl: string; ref: string; tempDir: string }): Promise<void> {
    await new Promise<void>((resolvePromise, rejectPromise) => {
        const child = spawn(
            "git",
            [
                "clone",
                "--depth", "1",
                "--single-branch",
                "--no-tags",
                "--branch", input.ref,
                input.repoUrl,
                input.tempDir
            ],
            { stdio: "inherit", shell: false }
        );

        child.on("error", (err) => rejectPromise(new Error(`Failed to start git: ${err.message}`)));
        child.on("exit", (code, signal) => {
            if (code === 0) {
                resolvePromise();
                return;
            }
            if (signal) {
                rejectPromise(new Error(`Git clone killed by signal ${signal}`));
                return;
            }
            rejectPromise(new Error(`Git clone failed with code ${code}`));
        });
    });
}

async function runPlopCommand(input: {
    cwd: string;
    plopfilePath: string;
    destination: string;
    plopArgs: string[];
}): Promise<void> {
    const plopArgsBase = [
        "--yes",
        "plop",
        "--plopfile",
        input.plopfilePath,
        "--dest",
        input.destination,
        ...input.plopArgs
    ];

    const command = process.platform === "win32" ? "cmd.exe" : "npx";
    const args = process.platform === "win32"
        ? ["/d", "/s", "/c", "npx", ...plopArgsBase]
        : plopArgsBase;

    await new Promise<void>((resolvePromise, rejectPromise) => {
        const child = spawn(command, args, {
            cwd: input.cwd,
            stdio: "inherit",
            shell: false
        });

        child.on("error", (err) => rejectPromise(new Error(`Failed to start plop: ${err.message}`)));
        child.on("exit", (code, signal) => {
            if (code === 0) {
                resolvePromise();
                return;
            }
            if (signal) {
                rejectPromise(new Error(`Plop killed by signal ${signal}`));
                return;
            }
            rejectPromise(new Error(`Plop exited with code ${code}`));
        });
    });
}