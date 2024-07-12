import * as net from "net";
import * as fs from "fs";
import * as process from "process";
import { Buffer } from "buffer";

const server = net.createServer((socket: any) => {
    socket.on("data", (data: any) => {
        const request = data.toString();
        console.log('Request:', request); // Debugging line
        const path = request.split(" ")[1];
        console.log('Path:', path); // Debugging line

        if (!path) {
            socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
            socket.end();
            return;
        }

        const query = path.split("/")[2];
        console.log('Query:', query); // Debugging line

        if (path === '/') {
            socket.write('HTTP/1.1 200 OK\r\n\r\n');
        } else if (path.startsWith('/echo/')) {
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${query.length}\r\n\r\n${query}`);
        } else if (path === '/user-agent') {
            const userAgent = request.split('User-Agent: ')[1]?.split('\r\n')[0];
            if (userAgent) {
                socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`);
            } else {
                socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
            }
        } else if (path.startsWith('/files/')) {
            const directory = process.argv[2]; // Corrected to argv[2]
            console.log('Directory:', directory); // Debugging line
            const fileName = path.replace('/files/', '');
            console.log('File Name:', fileName); // Debugging line

            fs.readFile(`${directory}/${fileName}`, 'utf8', (err: Error, fileData: string) => {
                if (err) {
                    console.error('File Read Error:', err); // Debugging line
                    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
                } else {
                    socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${Buffer.byteLength(fileData)}\r\n\r\n${fileData}`);
                }
                socket.end(); // Ensure the socket is ended after response is sent
            });
        } else {
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
            socket.end(); // Ensure the socket is ended after response is sent
        }
    });
});

server.listen(4221, "localhost");
