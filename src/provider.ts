import { InjectionToken } from './injection-token';

export interface Type<T> {
    new(...args: any[]): T;
}

export interface UseClassProvider<T> {
    provide: InjectionToken<T> | Type<T>;
    useClass: Type<any>;
    dependencies?: any[];
}

export interface UseFactoryProvider<T> {
    provide: InjectionToken<T> | Type<T>;
    useFactory: (...args: any[]) => any;
    dependencies?: any[];
}

export interface UseValueProvider<T> {
    provide: InjectionToken<T> | Type<T>;
    useValue: any;
}

export type Provider<T> = Type<T> | UseClassProvider<T> | UseFactoryProvider<T> | UseValueProvider<T>;
