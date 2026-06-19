import { resolve, join, dirname } from "path";
import { access, cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";

export type CloneOptions = {
    repoUrl: string;
    targetDir?: string;
    ref?: string;
    force?: boolean;
}


export async function runClone(options: CloneOptions): Promise<void> {
    console.log("Running clone with options:", options);
    const repoUrl = resolveGitHubHttpsRepo(options.repoUrl);
    const ref = options.ref || "main";
    const destination = resolve(
        options.targetDir && options.targetDir.trim()
            ? options.targetDir
            : inferTargetDirFromRepoUrl(repoUrl));

    await ensureDestinationIsWritable(destination, !!options.force);
    const tempParent = await ensureTempParent(destination);
    const tempDir = join(tempParent, `.nooget-temp-${Date.now()}`);

    try {
        await runGitClone({ repoUrl, ref, tempDir });
        await cp(
            tempDir,
            destination,
            {
                recursive: true,
                force: !!options.force || false,
                filter: (source) => {
                    const normalized = source.replaceAll("\\", "/");
                    return !normalized.endsWith("/.git") && !normalized.includes("/.git/");
                },

            }
        );
        console.log(`Template cloned successfully to ${destination}`);
    }
    catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {

        await rm(join(destination, ".git"), {
            recursive: true,
            force: true,
            maxRetries: 5,
            retryDelay: 200
        });
        await rm(tempDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(() => {
            console.warn(`Warning: Failed to clean up temporary directory: ${tempDir}. Please remove it manually.`);
        });
    }
}


async function runGitClone(input: {
    repoUrl: string;
    ref: string;
    tempDir: string;
}): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log(`Cloning template repository ${input.repoUrl} (ref: ${input.ref})...`);

        const spinnerFrames = ["|", "/", "-", "\\"];
        let spinnerIndex = 0;
        let capturedOutput = "";

        const clearProgress = () => {
            process.stdout.write("\r" + " ".repeat(80) + "\r");
        };

        const spinner = setInterval(() => {
            const frame = spinnerFrames[spinnerIndex++ % spinnerFrames.length];
            process.stdout.write(`\r${frame} Cloning template repository...`);
        }, 60);

        const gitProcess = spawn("git",
            [
                "clone",
                "--depth", "1",
                "--single-branch",
                "--no-tags",
                "--branch", input.ref,
                input.repoUrl,
                input.tempDir
            ], {
            stdio: ["ignore", "pipe", "pipe"],
            shell: false
        });

        gitProcess.stdout?.setEncoding("utf8");
        gitProcess.stdout?.on("data", (chunk) => {
            capturedOutput += chunk;
        });
        gitProcess.stderr?.on("data", (chunk) => {
            capturedOutput += chunk;
        });

        gitProcess.on("error", (err) => {
            clearInterval(spinner);
            clearProgress();
            reject(new Error(`Failed to start git process: ${err.message}`));
        });

        gitProcess.on("exit", (code, signal) => {
            clearInterval(spinner);
            clearProgress();
            if (code !== null && code !== 0) {
                reject(new Error(`Git clone failed with exit code ${code}`));
            } else if (signal) {
                reject(new Error(`Git clone process was killed with signal ${signal}`));
            }
            else if (code === 0) {
                console.log("Done.");
                resolve();
                return;
            }
            const failureMessage = signal ? `Git clone process was killed with signal ${signal}` : `Git clone failed with exit code ${code}`;
            const details = capturedOutput.trim() ? `\nGit output:\n${capturedOutput}` : "";
            reject(new Error(failureMessage + details));
        });
    });
}


function resolveGitHubHttpsRepo(repoInput: string): string {
    const trimmed = repoInput.trim();

    if (!trimmed) {
        throw new Error("Repository is required.");
    }

    if (/^https:\/\//i.test(trimmed)) {
        return trimmed;
    }

    if (/^[^/]+\/[^/]+$/.test(trimmed)) {
        return `https://github.com/${trimmed.replace(/\.git$/i, "")}.git`;
    }

    throw new Error(
        "Repository must be a GitHub HTTPS URL or GitHub shorthand in the form owner/repo."
    );
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

function inferTargetDirFromRepoUrl(repoUrl: string): string {
    const urlParts = repoUrl.split("/");
    const lastPart = urlParts[urlParts.length - 1] || ".";
    return lastPart.endsWith(".git") ? lastPart.slice(0, -4) : lastPart;
}

async function ensureDestinationIsWritable(
    destination: string,
    force: boolean
): Promise<void> {
    try {
        const entries = await readdir(destination);

        if (entries.length > 0 && !force) {
            throw new Error(
                `Destination already exists and is not empty: ${destination}. Use --force to allow overwriting.`
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