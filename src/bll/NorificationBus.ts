export interface Notification {
    message: string;
    type: 'err' | 'info' | 'warn';
    params?: any;
}

export class NotificationBus {
    public static instance = new NotificationBus();
    public static handlers: ((n: Notification) => void)[] = [];

    public static add(n: Notification) {
        for (const h of this.handlers) {
            h(n);
        }
    }
    public static register(handler: (n: Notification) => void) {
        this.handlers.push(handler);
    }

    private constructor() {}
}
