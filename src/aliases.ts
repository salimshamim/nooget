export type AliasResolution = {
    repoUrl: string;
    ref?: string;
};

const ALIAS_MAP: Record<string, AliasResolution> = {
    "@myorg/cdk": {
        repoUrl: "https://github.com/myorg/cdk-generator.git",
        ref: "main"
    }
};

export function resolveAlias(alias: string): AliasResolution {
    const resolved = ALIAS_MAP[alias];
    if (!resolved) {
        const dynamicAlias = alias.trim().startsWith("@") ? alias.trim().slice(1) : "";
        if (/^[^/]+\/[^/]+$/.test(dynamicAlias)) {
            return {
                repoUrl: `https://github.com/${dynamicAlias.replace(/\.git$/i, "")}.git`
            };
        }

        throw new Error(
            `Unknown scaffold alias: ${ alias }. Add it to src/aliases.ts or use @owner/repo.`
        );
    }
    return resolved;
}