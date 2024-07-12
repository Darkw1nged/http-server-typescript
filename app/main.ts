import * as net from "net";
import * as fs from "fs";
import * as process from "process";
import { Buffer } from "buffer";

const server = net.createServer((socket: any) => {
    socket.on("data", (data: any) => {
        const request = data.toString();
        console.log('Request:', request);
        const [requestLine, ...headerLines] = request.split('\r\n');
        const [method, path] = requestLine.split(' ');

        if (!path) {
            socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
            socket.end();
            return;
        }

        const headers: { [key: string]: string } = {};
        for (const headerLine of headerLines) {
            if (headerLine === '') break;
            const [key, value] = headerLine.split(': ');
            headers[key] = value;
        }

        const acceptEncoding = headers['Accept-Encoding'] || '';
        const supportsGzip = acceptEncoding.includes('gzip');

        if (method === 'GET') {
            if (path === '/') {
                socket.write('HTTP/1.1 200 OK\r\n\r\n');
            } else if (path.startsWith('/echo/')) {
                const query = path.split("/")[2];
                let response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${query.length}\r\n`;
                if (supportsGzip) {
                    response += 'Content-Encoding: gzip\r\n';
                }
                response += `\r\n${query}`;
                socket.write(response);
            } else if (path === '/user-agent') {
                const userAgent = headers['User-Agent'];
                if (userAgent) {
                    socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`);
                } else {
                    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
                }
            } else if (path.startsWith('/files/')) {
                const directory = process.argv[3];
                console.log('Directory:', directory);
                const fileName = path.replace('/files/', '');
                console.log('File Name:', fileName);

                fs.readFile(`${directory}/${fileName}`, 'utf8', (err: Error, fileData: string) => {
                    if (err) {
                        console.error('File Read Error:', err);
                        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
                    } else {
                        let response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${Buffer.byteLength(fileData)}\r\n`;
                        if (supportsGzip) {
                            response += 'Content-Encoding: gzip\r\n';
                        }
                        response += `\r\n${fileData}`;
                        socket.write(response);
                    }
                    socket.end();
                });
                return;
            } else {
                socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
            }
        } else if (method === 'POST' && path.startsWith('/files/')) {
            const directory = process.argv[3];
            const fileName = path.replace('/files/', '');
            console.log('POST Request for File:', fileName);

            const contentLength = parseInt(headers['Content-Length'], 10);
            const body = request.split('\r\n\r\n')[1].substring(0, contentLength);
            console.log('Body:', body);

            fs.writeFile(`${directory}/${fileName}`, body, 'utf8', (err: Error) => {
                if (err) {
                    console.error('File Write Error:', err);
                    socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
                } else {
                    socket.write('HTTP/1.1 201 Created\r\n\r\n');
                }
                socket.end();
            });
            return;
        } else {
            socket.write('HTTP/1.1 405 Method Not Allowed\r\n\r\n');
        }

        socket.end();
    });
});

server.listen(4221, "localhost");
