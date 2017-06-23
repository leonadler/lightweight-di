import { Inject } from 'lightweight-di';
import { Oil } from './oil';

export abstract class Tires {
    brand: string;
}

export class CheapTires implements Tires {
    brand = 'Cheap Tires Co.';
}

export class ExpensiveTires implements Tires {
    brand = 'Expensive Tires Co.';
}
