import { runClone } from "./clone.js";

type CliOptions = {
    repoUrl: string;
    targetDir?: string;
    ref?: string;
    force?: boolean;
}

function printHelp(): void {
    console.log(`Usage:
    nooget <repo> [target-dir] [--ref <branch>] [--force]

Repo formats:
    owner/repo
    https://github.com/owner/repo.git

Examples:
    nooget facebook/react
    nooget facebook/react my-app
    nooget https://github.com/facebook/react.git my-app --ref main`);
}

function parseArgs(argv: string[]): CliOptions {
    const args = [...argv];
    let ref = "main";
    let force = false;

    const helpRequested = args.includes("--help") || args.includes("-h");
    if (helpRequested) {
        printHelp();
        process.exit(0);
    }

    const refIndex = args.indexOf("--ref");
    if (refIndex !== -1) {
        const refValue = args[refIndex + 1];
        if (!refValue || refValue.startsWith("--")) {
            console.error("Error: --ref option requires a value.");
            printHelp();
            process.exit(1);
        }

        ref = refValue;
        args.splice(refIndex, 2); // Remove --ref and its value from args
    }

    const forceIndex = args.indexOf("--force");
    if (forceIndex !== -1) {
        force = true;
        args.splice(forceIndex, 1); // Remove --force from args
    }

    const repoUrl = args[0] || undefined;
    const targetDir = args[1] || undefined;

    if (!repoUrl) {
        console.error("Error: Repository URL is required.");
        printHelp();
        process.exit(1);
    }

    return {
        repoUrl,
        targetDir,
        ref,
        force
    };
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    console.log("Parsed CLI options:", options);
    await runClone(options);
}

main().then(() => {
    console.log("Operation completed successfully.");
}).catch((error) => {
    console.error("An error occurred:", error);
    process.exit(1);
});