import {Command} from 'commander';
import {CliOptions} from "../types/cli";
import * as fs from "fs";
import {Dictionary, PackageJson} from "../types";

export default class Cli {
    private program: Command;

    constructor() {
        this.program = new Command();

        this.program.version("0.1.0")
            .description("CLI to merge multiple package.json ")
            .usage("json1 json2 ... target_json")
            .option("-n, --new", "Create target package.json")
            .option("--only-dependencies", "Merge only dependencies, devDependencies and peerDependencies")
            .parse(process.argv);
    }

    public async handleCommand(): Promise<void> {
        const options: CliOptions = this.program.opts();
        const args: string[] = this.program.args;

        if (args.length < 3) {
            console.log("You must pass at least, 3 parameters")
            this.program.outputHelp();
            return;
        }

        this.handleOptions(args, options);

        this.processMerge(args, options);
    }

    private handleOptions(args: string[], options: CliOptions): void {
        if (options.new) {
            const targetFilename: string = args[args.length - 1];

            if (fs.existsSync(targetFilename)) {
                console.log(`File ${targetFilename} already exists. No file will be created.\n`);
                return;
            }
            fs.writeFileSync(targetFilename, "{}");
            console.log(`File ${targetFilename} has been created.\n`);
        }
    }

    private processMerge(args: string[], options: CliOptions) {
        const targetFilename: string = args[args.length - 1];

        if (!fs.existsSync(targetFilename)) {
            throw `File ${targetFilename} does not exists.\n`;
        }

        const data = fs.readFileSync(targetFilename, "utf-8");

        let targetPackageJson: PackageJson = JSON.parse(data);
        let packagesJson: PackageJson[] = this.loadPackagesJson(args);


        if (options.onlyDependencies) {
            this.mergeOnlyDependencies(packagesJson, targetPackageJson, targetFilename);
            return;
        }

        fs.writeFileSync(targetFilename, JSON.stringify(targetPackageJson, null, "\t"));
    }

    private mergeOnlyDependencies(packagesJson: PackageJson[], targetPackageJson: PackageJson, targetFilename: string) {
        let dependencies = packagesJson.filter(pkg => pkg.dependencies !== undefined).map(pkg => pkg.dependencies);
        if (dependencies.length > 0)
            targetPackageJson.dependencies = mergeDictionaries(dependencies as Dictionary<string>[]);

        let devDependencies = packagesJson.filter(pkg => pkg.devDependencies !== undefined).map(pkg => pkg.devDependencies);
        if (devDependencies.length > 0)
            targetPackageJson.devDependencies = mergeDictionaries(devDependencies as Dictionary<string>[]);

        let peerDependencies = packagesJson.filter(pkg => pkg.peerDependencies !== undefined).map(pkg => pkg.peerDependencies);
        if (peerDependencies.length > 0)
            targetPackageJson.peerDependencies = mergeDictionaries(peerDependencies as Dictionary<string>[]);

        fs.writeFileSync(targetFilename, JSON.stringify(targetPackageJson, null, "\t"));
    }

    private loadPackagesJson(args: string[]): PackageJson[] {
        let packagesJson: PackageJson[] = [];

        for (let i = 0; i < args.length - 1; i++) {
            const data = fs.readFileSync(args[i], "utf-8");
            let packageJson: PackageJson = JSON.parse(data);
            packagesJson.push(packageJson);
        }

        return packagesJson;
    }
}

function mergeDictionaries<T>(dicts: Dictionary<T>[]): Dictionary<T> {
    const merged: {[key: string]: any} = {};

    for (const dict of dicts) {
        for (const [key, value] of Object.entries(dict)) {
            if (!(key in merged)) {
                merged[key] = value;
            } else if (Array.isArray(value) && Array.isArray(merged[key])) {
                merged[key] = [...new Set([...merged[key], ...value])];
            } else if (typeof value === 'object' && typeof merged[key] === 'object') {
                merged[key] = mergeDictionaries([merged[key], value]);
            }
        }
    }

    return merged;
}