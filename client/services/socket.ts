let socket: WebSocket | null = null;

const initializeWebSocket = () => {
    if (!socket) {
        socket = new WebSocket('ws://localhost/ws/test/');

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onmessage = (event) => {
            console.log('Received message:', event.data);
        };

        socket.onclose = () => {
            console.log('WebSocket closed');
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
};

export const getWebSocket = () => {
    if (!socket) {
        initializeWebSocket();
    }
    return socket;
};

export default getWebSocket;