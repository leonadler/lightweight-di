import 'reflect-metadata';

/** Decorator to provide a DI Token. */
export function Injectable<T>(classConstructor: { new(...args: any[]): T }): void {
    if (!Reflect.hasMetadata('di-tokens', classConstructor)) {
        const paramTypes = classConstructor.length ? Reflect.getMetadata('design:paramtypes', classConstructor) : [];
        if (!paramTypes) {
            throw new Error(`InjectionError: No types emitted for class ${classConstructor.name}.`);
        }
        Reflect.defineMetadata('di-tokens', paramTypes, classConstructor);
    }
}
