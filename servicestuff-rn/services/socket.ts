import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
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
    private healthCheckInterval: NodeJS.Timeout | null = null;
    private appStateSubscription: any = null;
    private netInfoUnsubscribe: any = null;

    private constructor() {
        this.setupAppStateListener();
        this.setupNetworkListener();
        this.startHealthCheck();
    }

    static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    private setupAppStateListener() {
        if (this.appStateSubscription) return;

        this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                console.log('[SOCKET] App came to foreground, verifying connection...');
                if (this.currentStaffId && (!this.socket || !this.socket.connected)) {
                    this.connect(this.currentStaffId);
                } else if (this.socket?.connected) {
                    // Manual ping to ensure line is alive
                    console.log('[SOCKET] Pinging server for health check...');
                    this.socket.emit('heartbeat:manual', { timestamp: Date.now() });
                }
            } else if (nextAppState === 'background') {
                console.log('[SOCKET] App in background, maintaining socket heartbeat.');
            }
        });
    }

    private setupNetworkListener() {
        if (this.netInfoUnsubscribe) return;

        this.netInfoUnsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected && this.currentStaffId && (!this.socket || !this.socket.connected)) {
                console.log('[SOCKET] Network restored, attempting reconnection...');
                this.connect(this.currentStaffId);
            }
        });
    }

    private startHealthCheck() {
        if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);

        this.healthCheckInterval = setInterval(() => {
            if (this.currentStaffId) {
                if (!this.socket || !this.socket.connected) {
                    console.log('[SOCKET] Health check: socket disconnected, retrying...');
                    this.connect(this.currentStaffId);
                } else {
                    // Every 2 cycles, do a manual heartbeat emit to keep connection warm
                    this.socket.emit('heartbeat:keepalive', { staffId: this.currentStaffId });
                }
            }
        }, 15000); // Check every 15 seconds for stability
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
            console.log('[SOCKET] Connecting existing instance...');
            this.socket.auth = { token };
            this.socket.connect();
            return;
        }

        console.log('[SOCKET] Initializing new connection to:', SOCKET_URL);
        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 500,
            reconnectionDelayMax: 5000, // Very aggressive reconnection
            timeout: 10000,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected successfully! ID:', this.socket?.id);
            if (this.currentStaffId) {
                this.socket?.emit('join:technician', this.currentStaffId);
            }
            this.flushQueue();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
                // Unexpected disconnection, attempt manual recovery
                console.log('[SOCKET] Attempting immediate manual reconnection...');
                this.socket?.connect();
            }
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
