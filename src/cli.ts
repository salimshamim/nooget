import { runClone } from "./clone.js";

type CliOptions = {
    repoUrl: string;
    targetDir?: string;
    ref?: string;
    force?: boolean;
    plopArgs?: string[];
}

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
    const positionals: string[] = [];
    const fallbackPlopArgs: string[] = [];

    for (let i = 0; i < noogetArgs.length; i++) {
        const arg = noogetArgs[i];
        if(arg === undefined) continue;

        if (arg === "--help" || arg === "-h") {
            printHelp();
            process.exit(0);
        }

        if (arg === "--force") {
            force = true;
            continue;
        }

        if (arg === "--ref") {
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

        if (arg.startsWith("--")) {
            // Unknown option before "--" falls back to Plop passthrough mode.
            fallbackPlopArgs.push(arg);
            const next = noogetArgs[i + 1];
            if (next && !next.startsWith("--")) {
                fallbackPlopArgs.push(next);
                i++;
            }
            continue;
        }

        if (positionals.length < 2) {
            positionals.push(arg);
        } else {
            // Extra trailing non-option args also pass through to Plop.
            fallbackPlopArgs.push(arg);
        }
    }

    const repoUrl = positionals[0];
    const targetDir = positionals[1];
    const plopArgs = explicitPlopArgs.length > 0 ? explicitPlopArgs : fallbackPlopArgs;

    if (!repoUrl) {
        console.error("Error: Repository URL is required.");
        printHelp();
        process.exit(1);
    }

    return {
        repoUrl,
        targetDir,
        ref,
        force,
        plopArgs
    };
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    await runClone(options);
}

main().then(() => {
    console.log("Operation completed successfully.");
}).catch((error) => {
    console.error("An error occurred:", error);
    process.exit(1);
});