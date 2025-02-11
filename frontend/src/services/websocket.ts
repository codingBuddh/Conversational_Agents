type MessageCallback = (message: any) => void;
type ErrorCallback = (error: any) => void;

export class ChatWebSocket {
    private ws: WebSocket | null = null;
    private messageCallback: MessageCallback | null = null;
    private errorCallback: ErrorCallback | null = null;
    private isClosing: boolean = false;

    constructor(sessionId: string) {
        this.connect(sessionId);
    }

    private connect(sessionId: string) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return; // Already connected
        }

        this.ws = new WebSocket(`ws://localhost:8000/api/sessions/${sessionId}/ws`);
        this.isClosing = false;

        this.ws.onopen = () => {
            console.log('WebSocket connection established');
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (this.messageCallback) {
                    this.messageCallback(data);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            if (this.errorCallback) {
                this.errorCallback(error);
            }
        };

        this.ws.onclose = (event) => {
            console.log('WebSocket connection closed', event.code, event.reason);
            if (!this.isClosing && this.errorCallback) {
                this.errorCallback(new Error('Connection closed unexpectedly'));
            }
        };
    }

    public onMessage(callback: MessageCallback) {
        this.messageCallback = callback;
    }

    public onError(callback: ErrorCallback) {
        this.errorCallback = callback;
    }

    public sendMessage(content: string) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            if (this.errorCallback) {
                this.errorCallback(new Error('WebSocket is not connected'));
            }
            return;
        }

        try {
            this.ws.send(JSON.stringify({
                content,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error sending message:', error);
            if (this.errorCallback) {
                this.errorCallback(error);
            }
        }
    }

    public close() {
        if (this.ws && !this.isClosing) {
            this.isClosing = true;
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.close(1000, 'Client closing connection');
            }
            this.ws = null;
        }
    }
} 