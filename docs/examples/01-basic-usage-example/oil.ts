export abstract class Oil {
    abstract fillIntoMotor(): void;
}

export class MotorOil {
    fillIntoMotor() {
        console.log('Filling motor oil into motor...');
    }
}

export class OliveOil {
    fillIntoMotor() {
        throw new Error('Olive oil should not be used for motors!');
    }
    fillIntoSalad() {
        console.log('Filling olive oil into salad...');
    }
}
