import 'reflect-metadata';

/** Decorator to inject provided dependencies into the constructor of a class. */
export function Inject<T>(classConstructor: { new(...args: any[]): T }, methodName: undefined, parameterIndex: number): void;
export function Inject(valueToProvide: any): <T>(classConstructor: { new(...args: any[]): T }, methodName: undefined, parameterIndex: number) => void;

export function Inject(valueToProvide: any, methodName?: undefined, parameterIndex?: number): any {
    if (parameterIndex === undefined) {
        return (classConstructor: Function, methodName: undefined, parameterIndex: number): void => {
            // Set a specific value to provide as a constructor argument
            const typeMetadata = getDiTokens(classConstructor);
            typeMetadata[parameterIndex] = valueToProvide;
            Reflect.defineMetadata('di-tokens', typeMetadata, classConstructor);
        };
    } else {
        // Determine the value to provide from the TypeScript metadata
        const classConstructor: Function = valueToProvide;
        const typeMetadata = getDiTokens(classConstructor);
        const paramTypes = Reflect.getMetadata('design:paramtypes', classConstructor);
        if (!paramTypes) {
            throw new Error(`InjectionError: No type emitted for parameter ${parameterIndex + 1} of ${classConstructor.name}.`);
        }
        typeMetadata[parameterIndex] = paramTypes[parameterIndex];
        Reflect.defineMetadata('di-tokens', typeMetadata, classConstructor);
    }
}

function getDiTokens(classConstructor: Function): any[] {
    const existing = Reflect.getMetadata('di-tokens', classConstructor)
        || Reflect.getMetadata('design:paramtypes', classConstructor);
    return existing ? existing.slice() : new Array(classConstructor.length);
}

