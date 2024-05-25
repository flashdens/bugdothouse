import SERVER_URL from "@/config";

let socket: WebSocket | null = null;

const initializeWebSocket = (code: string) => {
    if (!socket) {
        socket = new WebSocket(`ws://localhost/ws/${code}/`);

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onmessage = (event) => {
            console.log('Received message:', event.data);
        };

        socket.onclose = () => {
            console.log('WebSocket closed');
            socket?.close();
            socket = null;
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
};

export const getWebSocket = (code: string) => {
    if (!socket) {
        initializeWebSocket(code);
    }
    return socket;
};

export default getWebSocket;