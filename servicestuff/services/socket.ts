import { io, Socket } from 'socket.io-client';
import { Preferences } from '@capacitor/preferences';
import { ENV } from '../lib/env';

const SOCKET_URL = ENV.REALTIME_URL; // Adjust for prod

export class SocketService {
    private static instance: SocketService;
    private socket: Socket | null = null;

    private constructor() { }

    static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    async connect(staffId: string) {
        if (this.socket?.connected) return;

        const { value: token } = await Preferences.get({ key: 'auth_token' });

        if (!token) {
            console.warn('Socket connect failed: No token');
            return;
        }

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
            this.socket?.emit('join:technician', staffId);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });

        // Global event listener for debugging
        this.socket.onAny((event, ...args) => {
            console.debug(`[SOCKET] ${event}`, args);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event: string, callback: (...args: any[]) => void) {
        if (!this.socket) return;
        this.socket.on(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void) {
        if (!this.socket) return;
        this.socket.off(event, callback);
    }

    emit(event: string, data: any) {
        if (!this.socket?.connected) {
            console.warn('Socket emit failed: Not connected');
            return;
        }
        this.socket.emit(event, data);
    }
}
