let socket: WebSocket = new WebSocket('ws://localhost/ws/test/');

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

export default socket;