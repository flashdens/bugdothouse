let socket: WebSocket | null = null;

const initializeWebSocket = (code: string) => {
        socket = new WebSocket(`ws://localhost/ws/${code}/`);

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onclose = () => {
            console.log('WebSocket closed');
            socket?.close();
            socket = null;
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

         return () => {
            if (socket && socket.readyState === 1) { // <-- This is important
                socket.close();
            }
        }
};

export const getWebSocket = (code: string) => {
    if (!socket) {
        initializeWebSocket(code);
    }
    return socket;
};

export default getWebSocket;