export interface PackageJson {
    name: string;
    version: string;
    description?: string;
    keywords?: string[];
    homepage?: string;
    bugs?: {
        url?: string;
        email?: string;
    };
    license?: string;
    author?: string | {
        name: string;
        email?: string;
        url?: string;
    };
    contributors?: string[] | {
        name: string;
        email?: string;
        url?: string;
    }[];
    files?: string[];
    main?: string;
    bin?: string | Dictionary<string>;
    man?: string | string[];
    directories?: {
        lib?: string;
        bin?: string;
        man?: string;
        doc?: string;
        example?: string;
    };
    repository?: {
        type: string;
        url: string;
    };
    scripts?: Dictionary<string>;
    config?: Dictionary<any>;
    dependencies?: Dictionary<string>;
    devDependencies?: Dictionary<string>;
    peerDependencies?: Dictionary<string>;
    optionalDependencies?: Dictionary<string>;
    bundledDependencies?: string[];
    engines?: Dictionary<string>;
    os?: string[];
    cpu?: string[];
    private?: boolean;
    publishConfig?: Dictionary<string>;
}

type Dictionary<T> = {
    [key: string]: T;
};

/*export interface PackageJson {
    "name",
    "version",
    "description",
    "keywords",
    "homepage",
    "bugs",
    "license",
    "author",
    "contributors",
    "files",
    "main",
    "bin",
    "man",
    "directories",
    "repository",
    "scripts",
    "config",
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
    "bundledDependencies",
    "engines,
    "os",
    "cpu",
    "private",
    "publishConfig",
}*/