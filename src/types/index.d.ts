export interface PackageJson {
    name: string;
    version: string;
    description?: string;
    keywords?: string[];
    homepage?: string;
    bugs?: Bugs;
    license?: string;
    author?: string | Author;
    contributors?: string[] | Contributor[];
    files?: string[];
    main?: string;
    bin?: string | Dictionary<string>;
    man?: string | string[];
    directories?: Directories;
    repository?: Repository;
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
    [key: string]: any;
}

type Dictionary<T> = {
    [key: string]: T;
};

type Bugs = {
    url?: string;
    email?: string;
};

type Author = {
    name: string;
    email?: string;
    url?: string;
};

type Contributor = {
    name: string;
    email?: string;
    url?: string;
};

type Directories = {
    lib?: string;
    bin?: string;
    man?: string;
    doc?: string;
    example?: string;
};

type Repository = {
    type: string;
    url: string;
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