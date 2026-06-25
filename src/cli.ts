import { resolveAlias } from "./aliases.js";
import { runClone } from "./clone.js";
import { runScaffold } from "./scaffold.js";

type BaseCliOptions = {
    source: string;
    targetDir?: string;
    ref?: string;
    force?: boolean;
    plopArgs?: string[];
};

type CloneCliOptions = BaseCliOptions & {
    mode: "clone";
};

type ScaffoldCliOptions = BaseCliOptions & {
    mode: "scaffold";
    alias: string;
};

type CliOptions = CloneCliOptions | ScaffoldCliOptions;

function printHelp(): void {
    console.log(`Usage:
    nooget <repo> [target-dir] [--ref <branch>] [--force] [-- <plop-args...>]

Repo formats:
    owner/repo
    https://github.com/owner/repo.git

Examples:
    nooget facebook/react
    nooget facebook/react my-app
    nooget https://github.com/facebook/react.git my-app --ref main
    nooget my-org/template my-app -- --name api --service users`);
}

function parseArgs(argv: string[]): CliOptions {
    const separatorIndex = argv.indexOf("--");
    const noogetArgs = separatorIndex === -1 ? [...argv] : argv.slice(0, separatorIndex);
    const explicitPlopArgs = separatorIndex === -1 ? [] : argv.slice(separatorIndex + 1);

    let ref = "main";
    let force = false;
    let source: string | undefined;
    let targetDir: string | undefined;

    const fallbackPlopArgs: string[] = [];
    let optionsStarted = false;

    for (let i = 0; i < noogetArgs.length; i++) {
        const arg = noogetArgs[i];
        if (!arg) continue;

        if (arg === "--help" || arg === "-h") {
            printHelp();
            process.exit(0);
        }

        if (arg === "--force") {
            force = true;
            optionsStarted = true;
            continue;
        }

        if (arg === "--ref") {
            optionsStarted = true;
            const refValue = noogetArgs[i + 1];
            if (!refValue || refValue.startsWith("--")) {
                console.error("Error: --ref option requires a value.");
                printHelp();
                process.exit(1);
            }
            ref = refValue;
            i++;
            continue;
        }

        if (arg === "--target-dir") {
            optionsStarted = true;
            const dirValue = noogetArgs[i + 1];
            if (!dirValue || dirValue.startsWith("--")) {
                console.error("Error: --target-dir option requires a value.");
                printHelp();
                process.exit(1);
            }
            targetDir = dirValue;
            i++;
            continue;
        }

        if (arg.startsWith("--")) {
            // Unknown options before "--" are treated as plop passthrough.
            optionsStarted = true;
            fallbackPlopArgs.push(arg);

            const next = noogetArgs[i + 1];
            if (next && !next.startsWith("--")) {
                fallbackPlopArgs.push(next);
                i++;
            }
            continue;
        }

        // Positional handling:
        // 1) first positional is always source
        // 2) second positional is targetDir only if it appears before any option
        // 3) everything else is plop passthrough fallback
        if (!source) {
            source = arg;
            continue;
        }

        if (!optionsStarted && !targetDir) {
            targetDir = arg;
            continue;
        }

        fallbackPlopArgs.push(arg);
    }

    const plopArgs = explicitPlopArgs.length > 0 ? explicitPlopArgs : fallbackPlopArgs;

    if (!source) {
        console.error("Error: Repository URL is required.");
        printHelp();
        process.exit(1);
    }

    if (source.startsWith("@")) {
        return {
            mode: "scaffold",
            alias: source,
            source,
            targetDir,
            ref,
            force,
            plopArgs
        };
    }

    return {
        mode: "clone",
        source,
        targetDir,
        ref,
        force,
        plopArgs
    };
}

async function main() {
    const options = parseArgs(process.argv.slice(2));

    if (options.mode === "scaffold") {
        const resolved = resolveAlias(options.alias);
        await runScaffold({
            alias: options.alias,
            generatorUrl: resolved.repoUrl,
            targetDir: options.targetDir,
            ref: options.ref || resolved.ref || "main",
            force: options.force,
            plopArgs: options.plopArgs
        });
        return;
    }

    await runClone({
        repoUrl: options.source,
        targetDir: options.targetDir,
        ref: options.ref,
        force: options.force,
        plopArgs: options.plopArgs
    });
}

main().then(() => {
    console.log("Operation completed successfully.");
}).catch((error) => {
    console.error("An error occurred:", error);
    process.exit(1);
});