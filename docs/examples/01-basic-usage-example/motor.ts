import { Inject } from 'lightweight-di';
import { Oil } from './oil';

export class Motor {
    constructor(@Inject private oil: Oil) { }

    makeSounds() {
        console.log('wrooooom');
    }

    refillOil() {
        this.oil.fillIntoMotor();
    }
}
