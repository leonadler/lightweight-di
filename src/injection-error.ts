export class InjectionError extends Error {
    token: any;

    constructor(message: string, token: any) {
        super(message);
        Object.setPrototypeOf(this, InjectionError.prototype);

        this.message = message;
        this.name = 'InjectionError';
        this.token = token;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InjectionError);
        }
    }
}
