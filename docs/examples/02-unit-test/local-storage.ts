export class LocalStorage {
    getItem(key: string): string | null {
        return localStorage.getItem(key);
    }

    setItem(key: string, data: string): void {
        localStorage.setItem(key, data);
    }
}
