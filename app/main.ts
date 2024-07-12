import * as net from "net";

const server = net.createServer((socket: any) => {
    socket.on("data", (data: any) => {
        const request = data.toString();
        const path = request.split(" ")[1];

        if (path === '/echo/') {
            const echo = request.split(" ")[2];
            const res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${echo.length}\r\n\r\n${echo}`;
            socket.write(res);
            socket.end();
            return;
        }

        const res = path === '/' ? 'HTTP/1.1 200 OK\r\n\r\n' : 'HTTP/1.1 404 Not Found\r\n\r\n';
        socket.write(res);
        socket.end();
    });
});

server.listen(4221, "localhost");
