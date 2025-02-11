type MessageCallback = (message: any) => void;
type ErrorCallback = (error: any) => void;

export class ChatWebSocket {
    private ws: WebSocket | null = null;
    private messageCallback: MessageCallback | null = null;
    private errorCallback: ErrorCallback | null = null;

    constructor(sessionId: string) {
        this.connect(sessionId);
    }

    private connect(sessionId: string) {
        this.ws = new WebSocket(`ws://localhost:8000/api/sessions/${sessionId}/ws`);

        this.ws.onopen = () => {
            console.log('WebSocket connection established');
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (this.messageCallback) {
                this.messageCallback(data);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            if (this.errorCallback) {
                this.errorCallback(error);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
        };
    }

    public onMessage(callback: MessageCallback) {
        this.messageCallback = callback;
    }

    public onError(callback: ErrorCallback) {
        this.errorCallback = callback;
    }

    public sendMessage(content: string) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                content,
                timestamp: new Date().toISOString()
            }));
        } else {
            console.error('WebSocket is not connected');
            if (this.errorCallback) {
                this.errorCallback(new Error('WebSocket is not connected'));
            }
        }
    }

    public close() {
        if (this.ws) {
            this.ws.close();
        }
    }
} 