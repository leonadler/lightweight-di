export class InjectionToken<T> {
    readonly name: string;
    constructor(name: string) {
        this.name = name;
    }

    toString(): string {
        return `InjectionToken(${this.name})`;
    }
}
