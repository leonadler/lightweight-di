import { Injectable } from './injectable';
import { Provider, Type } from './provider';
import { InjectionToken } from './injection-token';

interface Factory {
    factory(...args: any[]): any;
    dependencies: any[];
}

@Injectable
export class Injector {
    private factories: Map<any, Factory> = new Map();
    private resolved: Map<any, any> = new Map();

    createChildInjector(): Injector {
        const childInjector = new Injector();
        childInjector.factories = new Map(this.factories);
        return childInjector;
    }

    overrideDependency(token: any, value: any): void {
        this.factories.set(token, value);
    }

    get<T>(token: Type<T>): T;
    get<T>(token: InjectionToken<T>): T;
    get(token: any): any {
        if (this.resolved.has(token)) {
            return this.resolved.get(token);
        }

        if (this.factories.has(token)) {
            const factory = this.factories.get(token)!;
            const dependencies = factory.dependencies.map(d => this.get(d));
            const resolvedValue = factory.factory(...dependencies);
            this.resolved.set(token, resolvedValue);
            return resolvedValue;
        }

        const name = typeof token === 'function' ? token.name : token.toString();
        throw new Error(`InjectionError: No provider for ${name}.`);
    }

    static resolveAndCreate(providers: Provider<any>[]): Injector {
        // First, create a list of all passed dependencies
        const definedDependencies = new Set<any>([Injector]);
        for (const provider of providers as any[]) {
            if (provider && provider.provide && !provider.prototype) {
                // Provider is passed as { provide: ... } hash
                definedDependencies.add(provider.provide);
            } else if (provider && provider.prototype && provider.prototype.constructor === provider) {
                // Provider is a class
                definedDependencies.add(provider);
            } else {
                throw new Error(`Invalid provider: ${provider}`);
            }
        }

        const injector = new Injector();
        const factories = injector.factories;

        // Provide the injector itself
        factories.set(Injector, { factory: () => injector, dependencies: [] });
        injector.resolved.set(Injector, injector);

        // Now for all providers, check if their dependencies are in the created list
        // and normalize their format to a { factory, dependencies } hash.
        for (const provider of providers as any[]) {
            const token: any = provider.provide;

            if (provider == null) {
                throw injectionError(`Invalid provider ${provider}.`, provider);
            } else if (!token && provider.prototype && provider.prototype.constructor === provider) {
                // Provider is a class
                const dependencies = getDiTokens(provider);
                factories.set(provider, {
                    factory: (...args: any[]) => new provider(...args),
                    dependencies
                });
            } else if (!token) {
                throw injectionError(`Invalid provider ${provider}.`, provider);
            } else if ('useValue' in provider) {
                // Provider is a { provide: ClassName, useValue: ... } object
                const valueToUse = provider.useValue;
                factories.set(token, {
                    factory: () => valueToUse,
                    dependencies: []
                });
                injector.resolved.set(token, valueToUse);
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

        validateDependencyTree(Array.from(factories.keys()), factories, []);

        return injector;
    }
}

function injectionError(message: string, token: any): Error {
    let error = new Error('InjectionError: ' + message);
    (error as any).token = token;
    return error;
}

function getDiTokens(classConstructor: Function): any[] {
    const metadata = Reflect.getMetadata('di-tokens', classConstructor);
    if (metadata) {
        return metadata;
    } else if (!classConstructor.length) {
        return [];
    }
    throw injectionError('Class with dependencies is provided but not decorated with @Injectable or @Inject', classConstructor);
}

/** Throws on missing dependencies or circular dependencies */
function validateDependencyTree(dependencies: any[], factories: Map<any, Factory>, dependents: any[]): void {
    for (const dependency of dependencies) {
        const name = dependency.name || String(dependency);

        if (dependents.includes(dependency)) {
            throw injectionError(`Circular dependency: "${name}" is required by one of its dependencies.`, dependency);
        } else if (!factories.has(dependency)) {
            throw injectionError(`No provider for "${name}".`, dependency);
        }

        const factory = factories.get(dependency)!;
        validateDependencyTree(factory.dependencies, factories, [...dependents, dependency]);
    }
}
