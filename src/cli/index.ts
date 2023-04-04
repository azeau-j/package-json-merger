import {Command} from 'commander';
import {CliOptions} from "../types/cli";
import * as fs from "fs";
import {Dictionary, PackageJson} from "../types";

export default class Cli {
    private program: Command;
    private options: CliOptions;
    private args: string[];

    constructor() {
        this.program = new Command();

        this.program.version("0.1.0")
            .description("CLI to merge multiple package.json ")
            .usage("json1 json2 ... target_json")
            .option("-n, --new", "Create target package.json")
            .option("--only-dependencies", "Merge only dependencies, devDependencies and peerDependencies")
            .option("--name <str>", "'name' field for the new package.json. By default the name in target will be kept, if no target is set the name in the first json will be use")
            .option("--package-version <str>", "'version' field for the new package.json. By default the version in target will be kept, if no target is set the version in the first json will be use")
            .option("--description <str>", "'description' field for the new package.json. By default the description in target will be kept, if no target set the description in the first json will be use")
            .option("--not-merge <str...>", "List of filed to not merge")
            .option("--verbose", "Show logs")
            .parse(process.argv);

        this.options = {};
        this.args = [];
    }

    public async handleCommand(): Promise<void> {
        this.options = this.program.opts();
        this.args = this.program.args;

        if (this.args.length < 3) {
            console.log("You must pass at least, 3 parameters")
            this.program.outputHelp();
            return;
        }

        this.handleOptions();

        this.processMerge();
    }

    private handleOptions(): void {
        let {options, args} = this;
        if (options.new) {
            const targetFilename: string = args[args.length - 1];

            if (fs.existsSync(targetFilename)) {
                if (options.verbose)
                    console.log(`File ${targetFilename} already exists. No file will be created.\n`);
                return;
            }
            fs.writeFileSync(targetFilename, "{}");

            if (options.verbose)
                console.log(`File ${targetFilename} has been created.\n`);
        }
    }

    private processMerge() {
        let {options, args} = this;
        const targetFilename: string = args[args.length - 1];

        if (!fs.existsSync(targetFilename)) {
            throw `File ${targetFilename} does not exists.\n`;
        }

        const data = fs.readFileSync(targetFilename, "utf-8");

        let targetPackageJson: PackageJson = JSON.parse(data);
        let packagesJson: PackageJson[] = this.loadPackagesJson(args);

        if (options.onlyDependencies) {
            targetPackageJson = this.mergeDependencies(packagesJson, targetPackageJson);
            fs.writeFileSync(targetFilename, JSON.stringify(targetPackageJson, null, "\t"));
            return;
        }

        if (options.name)
            targetPackageJson.name = options.name
        if (options.packageVersion)
            targetPackageJson.version = options.packageVersion
        if (options.description)
            targetPackageJson.description = options.description
        targetPackageJson = this.mergeDependencies(packagesJson, targetPackageJson);

        let keys: string[] = Object.keys(targetPackageJson);

        for (let i = 0; i < keys.length; i++) {
            let key: string = keys[i];

            if (key === "dependencies" || key === "devDependencies" || key === "peerDependencies")
                continue;

            if (options.notMerge && options.notMerge.includes(key))
                continue;

            let typeOfValue: string = typeof targetPackageJson[key]

            if (typeOfValue == "string")
                continue;

            if (isDictionary(targetPackageJson[key])) {
                if (options.verbose)
                    console.log(`Merge "${key}"`);
                this.mergeDictionariesField([targetPackageJson, ...packagesJson], targetPackageJson, key);
            }
        }

        for (let i = 0; i < packagesJson.length; i++) {
            let packageJson = packagesJson[i];
            let keys: string[] = Object.keys(packageJson);

            for (let i = 0; i < keys.length; i++) {
                let key: string = keys[i];

                if (key === "dependencies" || key === "devDependencies" || key === "peerDependencies")
                    continue;

                if (options.notMerge && options.notMerge.includes(key))
                    continue;

                let typeOfValue: string = typeof packageJson[key]

                if (typeOfValue === "string" || typeOfValue === 'booleans') {
                    if (packageJson[key] === undefined) {
                        if (options.verbose)
                            console.log(`Copy "${key}" to target`);
                        targetPackageJson[key] = packageJson[key]
                    }
                }

                if (isArrayOfStrings(packageJson[key])) {
                    if (options.verbose)
                        console.log(`Merge "${key}"`);
                    targetPackageJson = this.mergeListField([targetPackageJson, ...packagesJson], targetPackageJson, key)
                    continue;
                }

                if (isDictionary(packageJson[key])) {
                    if (options.verbose)
                        console.log(`Merge "${key}"`);
                    targetPackageJson = this.mergeDictionariesField([targetPackageJson, ...packagesJson], targetPackageJson, key);
                }
            }
        }

        fs.writeFileSync(targetFilename, JSON.stringify(targetPackageJson, null, "\t"));
    }

    private mergeListField(packagesJson: PackageJson[], targetPackageJson: PackageJson, fieldName: string): PackageJson {
        let data = packagesJson.filter(pkg => pkg[fieldName] !== undefined).map(pkg => pkg[fieldName]);
        /*if (data.length > 0)
            console.log(data)*/
        return targetPackageJson;
    }

    private mergeDictionariesField(packagesJson: PackageJson[], targetPackageJson: PackageJson, fieldName: string): PackageJson {
        let data = packagesJson.filter(pkg => pkg[fieldName] !== undefined).map(pkg => pkg[fieldName]);
        if (data.length > 0)
            targetPackageJson[fieldName] = mergeDictionaries(data as Dictionary<string>[]);
        return targetPackageJson;
    }

    private mergeDependencies(packagesJson: PackageJson[], targetPackageJson: PackageJson): PackageJson {
        let dependencies = packagesJson.filter(pkg => pkg.dependencies !== undefined).map(pkg => pkg.dependencies);
        if (dependencies.length > 0)
            targetPackageJson.dependencies = mergeDictionaries(dependencies as Dictionary<string>[]);

        let devDependencies = packagesJson.filter(pkg => pkg.devDependencies !== undefined).map(pkg => pkg.devDependencies);
        if (devDependencies.length > 0)
            targetPackageJson.devDependencies = mergeDictionaries(devDependencies as Dictionary<string>[]);

        let peerDependencies = packagesJson.filter(pkg => pkg.peerDependencies !== undefined).map(pkg => pkg.peerDependencies);
        if (peerDependencies.length > 0)
            targetPackageJson.peerDependencies = mergeDictionaries(peerDependencies as Dictionary<string>[]);

        return targetPackageJson;
    }

    private loadPackagesJson(args: string[]): PackageJson[] {
        let packagesJson: PackageJson[] = [];

        for (let i = 0; i < args.length - 1; i++) {
            const data = fs.readFileSync(args[i], "utf-8");
            let packageJson: PackageJson = JSON.parse(data);
            packagesJson.push(packageJson);
        }

        if (this.options.verbose)
            console.log(`${packagesJson.length} json loaded !\n`)

        return packagesJson;
    }
}

function isArrayOfStrings(value: any): value is string[] {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isDictionary<T>(value: any): value is Dictionary<T> {
    return typeof value === 'object' && value !== null;
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