import { InjectionToken } from './injection-token';

export interface Type<T> extends Function {
    new(...args: any[]): T;
}

interface UseClassProvider<T> {
    provide: InjectionToken<T> | Type<T>;
    useClass: Type<any>;
    dependencies?: any[];
}

interface UseFactoryProvider<T> {
    provide: InjectionToken<T> | Type<T>;
    useFactory: (...args: any[]) => any;
    dependencies?: any[];
}

interface UseValueProvider<T> {
    provide: InjectionToken<T> | Type<T>;
    useValue: any;
}

export type Provider<T> = Type<T> | UseClassProvider<T> | UseFactoryProvider<T> | UseValueProvider<T>;
