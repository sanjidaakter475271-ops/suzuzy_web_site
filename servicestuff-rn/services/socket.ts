import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { ENV } from '../lib/env';

const SOCKET_URL = ENV.REALTIME_URL;
const AUTH_TOKEN_KEY = 'auth_token';

interface QueuedEvent {
    event: string;
    data: any;
}

export class SocketService {
    private static instance: SocketService;
    private socket: Socket | null = null;
    private eventQueue: QueuedEvent[] = [];
    private currentStaffId: string | null = null;

    private constructor() { }

    static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    async connect(staffId: string) {
        this.currentStaffId = staffId;
        if (this.socket?.connected) return;

        const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);

        if (!token) {
            console.warn('Socket connect failed: No token');
            return;
        }

        // If socket exists but disconnected, try to update auth and connect
        if (this.socket) {
            this.socket.auth = { token };
            this.socket.connect();
            return;
        }

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
            if (this.currentStaffId) {
                this.socket?.emit('join:technician', this.currentStaffId);
            }
            this.flushQueue();
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

    async reconnect(staffId?: string) {
        if (staffId) this.currentStaffId = staffId;
        console.log('[SOCKET] Forcing reconnect with fresh token');
        this.disconnect();
        if (this.currentStaffId) {
            await this.connect(this.currentStaffId);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    isConnected(): boolean {
        return !!this.socket?.connected;
    }

    private flushQueue() {
        if (!this.socket?.connected || this.eventQueue.length === 0) return;
        console.log(`[SOCKET] Flushing ${this.eventQueue.length} queued events`);
        while (this.eventQueue.length > 0) {
            const item = this.eventQueue.shift();
            if (item) {
                this.socket.emit(item.event, item.data);
            }
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
            console.warn(`[SOCKET] Queueing event (not connected): ${event}`);
            this.eventQueue.push({ event, data });
            // Limit queue size to prevent memory leaks
            if (this.eventQueue.length > 50) {
                this.eventQueue.shift();
            }
            return;
        }
        this.socket.emit(event, data);
    }
}
