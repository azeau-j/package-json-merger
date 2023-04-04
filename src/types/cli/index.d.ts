export interface CliOptions {
    name?: string
    packageVersion?: string
    description?: string
    new?: boolean
    onlyDependencies?: boolean
    notMerge?: string[],
    verbose?: boolean
}