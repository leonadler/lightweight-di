import { Injectable } from './injectable';
import { Provider, Type } from './provider';
import { InjectionToken } from './injection-token';
import { InjectionError } from './injection-error';

interface Factory {
    factory(...args: any[]): any;
    dependencies: any[];
}

@Injectable
export class Injector {
    private factories: Map<any, Factory> = new Map();
    private resolved: Map<any, any> = new Map();
    private parentInjector: Injector | undefined;

    /**
     * Create a child injector that inherits all factories and resolved values.
     * Providers may be added and dependencies overridden without effecting the parent injector.
     *
     * @param tokensToProvide An array of tokens the child injector should construct locally.
     */
    createChildInjector(tokensToProvide: Array<Type<any>|InjectionToken<any>>): Injector {
        const childInjector = new Injector();
        childInjector.parentInjector = this;
        childInjector.factories = new Map();

        for (const token of tokensToProvide) {
            let injector: Injector | undefined = this;
            while (injector && !injector.factories.has(token)) {
                injector = injector.parentInjector;
            }

            if (!injector) {
                throw new InjectionError(`InjectionError: No provider for ${tokenName(token)}.`, token);
            }
            const factory = injector.factories.get(token)!;
            childInjector.factories.set(token, factory);
        }

        childInjector.factories.set(Injector, { factory: () => childInjector, dependencies: [] });
        childInjector.resolved.set(Injector, childInjector);
        return childInjector;
    }

    /** Override a dependency token for unit tests */
    overrideDependency(token: Type<any> | InjectionToken<any>, value: any): void {
        this.factories.set(token, { factory: () => value, dependencies: [] });
        this.resolved.set(token, value);
    }

    get<T>(token: Type<T>): T;
    get<T>(token: InjectionToken<T>): T;
    get<T, U>(token: Type<T>, notFoundValue: U): T | U;
    get<T, U>(token: InjectionToken<T>, notFoundValue: U): T | U;
    get(token: any, notFoundValue?: any): any {
        if (this.resolved.has(token)) {
            return this.resolved.get(token);
        }

        if (token === Injector) {
            return this;
        }

        let injector: Injector = this;
        do {
            if (injector.resolved.has(token)) {
                const resolvedValue = injector.resolved.get(token);
                this.resolved.set(token, resolvedValue);
                return resolvedValue;
            }

            if (injector.factories.has(token)) {
                const factory = injector.factories.get(token)!;
                const dependencies = factory.dependencies.map(dep => injector!.get(dep));
                const resolvedValue = factory.factory(...dependencies);
                injector.resolved.set(token, resolvedValue);
                this.resolved.set(token, resolvedValue);
                return resolvedValue;
            }
        } while (injector = injector.parentInjector!);

        if (arguments.length > 1) {
            return notFoundValue;
        }

        throw new InjectionError(`InjectionError: No provider for ${tokenName(token)}.`, token);
    }

    static isValidProvider(input: any): input is Provider<any> {
        if (typeof input === 'function' && input.prototype && input.prototype.constructor === input) {
            return true;
        } else if (typeof input === 'object' && input && input.provide) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Resolve the all dependencies of the passed providers as dependency tree
     * and return an injector that creates and returns instances of the dependencies.
     *
     * All classes that are not explicitly provided are resolved to the class itself,
     * missing InjectionToken providers throw an exception.
     *
     * @example
     *     const injector = Injector.autoResolveAndCreate([App]);
     */
    static autoResolveAndCreate(providers: Provider<any>[]): Injector {
        validateProviders(providers);

        const injector = new Injector();
        const factories = injector.factories = factoriesFromProviders(providers);
        const dependencies = Array.from(factories.keys());
        throwOnCircularDependencies(dependencies, factories, []);
        addMissingClassDependencies(dependencies, factories);
        throwOnCircularDependencies(dependencies, factories, []);
        throwOnMissingDependencies(dependencies, factories);

        return injector;
    }

    /**
     * Resolve the passed providers as dependency tree and return an injector
     * that creates and returns instances of the dependencies.
     *
     * Providers for all nested dependencies need to be in the input array.
     *
     * @example
     *     const injector = Injector.resolveAndCreate([App, Dependency1, Dependency2]);
     */
    static resolveAndCreate(providers: Provider<any>[]): Injector {
        validateProviders(providers);

        const injector = new Injector();
        const factories = injector.factories = factoriesFromProviders(providers);
        const dependencies = Array.from(factories.keys());
        throwOnCircularDependencies(dependencies, factories, []);
        throwOnMissingDependencies(dependencies, factories);

        return injector;
    }
}

function tokenName(token: any): string {
    return token && token.name || String(token);
}

function getDiTokens(classConstructor: Function): any[] {
    const metadata = Reflect.getMetadata('di-tokens', classConstructor);
    if (metadata) {
        return metadata;
    } else if (!classConstructor.length) {
        return [];
    }
    throw new InjectionError('Class with dependencies is provided but not decorated with @Injectable or @Inject', classConstructor);
}

/** Normalize providers to a `{ factory, dependencies }` hash. */
function factoriesFromProviders(providers: Provider<any>[]) {
    const factories = new Map<any, any>();

    for (const provider of providers as any[]) {
        const token: any = provider.provide;

        if (!token && provider.prototype && provider.prototype.constructor === provider) {
            // Provider is a class
            const dependencies = getDiTokens(provider);
            factories.set(provider, {
                factory: (...args: any[]) => new provider(...args),
                dependencies
            });
        } else if ('useValue' in provider) {
            // Provider is a { provide: ClassName, useValue: ... } object
            const valueToUse = provider.useValue;
            factories.set(token, {
                factory: () => valueToUse,
                dependencies: []
            });
        } else if ('useFactory' in provider) {
            // Provider is a { provide: ClassName, useFactory: ... } object
            factories.set(token, {
                factory: provider.useFactory,
                dependencies: provider.dependencies || []
            });
        } else if ('useClass' in provider) {
            // Provider is a { provide: ClassName, useClass: ... } object
            const classToUse = provider.useClass;
            factories.set(token, {
                factory: (...args: any[]) => new classToUse(...args),
                dependencies: provider.dependencies || getDiTokens(classToUse)
            });
        }
    }

    return factories;
}

/** Throw if a provider is not a class or a `{ provide: ... }` hash */
function validateProviders(providers: Provider<any>[]) {
    for (const p of providers as any[]) {
        if (!Injector.isValidProvider(p)) {
            throw new Error(`Invalid provider: ${p}`);
        }
    }
}

function throwOnCircularDependencies(dependencies: any[], factories: Map<any, Factory>, dependents: any[]): void {
    for (const dependency of dependencies) {
        if (dependents.indexOf(dependency) >= 0) {
            throw new InjectionError(`Circular dependency: "${tokenName(dependency)}" is required by one of its dependencies.`, dependency);
        }

        const factory = factories.get(dependency);
        if (factory) {
            throwOnCircularDependencies(factory.dependencies, factories, [...dependents, dependency]);
        }
    }
}

function throwOnMissingDependencies(dependencies: any[], factories: Map<any, Factory>): void {
    for (const dependency of dependencies) {
        if (!factories.has(dependency)) {
            throw new InjectionError(`No provider for "${tokenName(dependency)}".`, dependency);
        }

        const factory = factories.get(dependency)!;
        throwOnMissingDependencies(factory.dependencies, factories);
    }
}

function addMissingClassDependencies(dependencies: any[], factories: Map<any, Factory>): void {
    for (const dependency of dependencies) {
        let factory = factories.get(dependency);
        if (!factory) {
            if (typeof dependency === 'function' && dependency.prototype && dependency.prototype.constructor === dependency) {
                // dependency is a class constructor, add a factory for it
                const classDependencies = getDiTokens(dependency);
                factories.set(dependency, factory = {
                    factory: (...args: any[]) => new dependency(...args),
                    dependencies: classDependencies
                });
            } else {
                // dependency is an InjectionToken
                throw new InjectionError(`No provider for "${tokenName(dependency)}".`, dependency);
            }
        }

        addMissingClassDependencies(factory.dependencies, factories);
    }
}
