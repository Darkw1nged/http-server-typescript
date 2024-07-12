import * as net from "net";
import * as fs from "fs";
import * as process from "process";
import * as zlib from "zlib";
import { Buffer } from "buffer";

const handleGzipCompression = (data: string, callback: (err: Error | null, compressed?: Buffer) => void) => {
    zlib.gzip(data, callback);
};

const sendResponse = (socket: any, statusCode: string, headers: { [key: string]: string }, body: string | Buffer) => {
    let response = `HTTP/1.1 ${statusCode}\r\n`;
    for (const [key, value] of Object.entries(headers)) {
        response += `${key}: ${value}\r\n`;
    }
    response += `\r\n`;
    socket.write(response);
    socket.write(body);
    socket.end();
};

const handleRequest = (socket: any, request: string) => {
    console.log('Request:', request);
    const [requestLine, ...headerLines] = request.split('\r\n');
    const [method, path] = requestLine.split(' ');

    if (!path) {
        sendResponse(socket, '400 Bad Request', {}, '');
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
        handleGetRequest(socket, path, headers, supportsGzip);
    } else if (method === 'POST' && path.startsWith('/files/')) {
        handlePostRequest(socket, path, headers, request);
    } else {
        sendResponse(socket, '405 Method Not Allowed', {}, '');
    }
};

const handleGetRequest = (socket: any, path: string, headers: { [key: string]: string }, supportsGzip: boolean) => {
    if (path === '/') {
        sendResponse(socket, '200 OK', {}, '');
    } else if (path.startsWith('/echo/')) {
        const query = path.split("/")[2];
        const responseHeaders: any = { 'Content-Type': 'text/plain' };

        if (supportsGzip) {
            handleGzipCompression(query, (err, compressed) => {
                if (err) {
                    console.error('Gzip Error:', err);
                    sendResponse(socket, '500 Internal Server Error', {}, '');
                } else {
                    responseHeaders['Content-Encoding'] = 'gzip';
                    responseHeaders['Content-Length'] = compressed!.length.toString();
                    sendResponse(socket, '200 OK', responseHeaders, compressed!);
                }
            });
        } else {
            responseHeaders['Content-Length'] = query.length.toString();
            sendResponse(socket, '200 OK', responseHeaders, query);
        }
    } else if (path === '/user-agent') {
        const userAgent = headers['User-Agent'];
        if (userAgent) {
            const responseHeaders: any = { 'Content-Type': 'text/plain', 'Content-Length': userAgent.length.toString() };
            sendResponse(socket, '200 OK', responseHeaders, userAgent);
        } else {
            sendResponse(socket, '400 Bad Request', {}, '');
        }
    } else if (path.startsWith('/files/')) {
        const directory = process.argv[3];
        const fileName = path.replace('/files/', '');
        fs.readFile(`${directory}/${fileName}`, 'utf8', (err, fileData) => {
            if (err) {
                console.error('File Read Error:', err);
                sendResponse(socket, '404 Not Found', {}, '');
            } else {
                const responseHeaders: any = { 'Content-Type': 'application/octet-stream' };
                if (supportsGzip) {
                    handleGzipCompression(fileData, (err, compressed) => {
                        if (err) {
                            console.error('Gzip Error:', err);
                            sendResponse(socket, '500 Internal Server Error', {}, '');
                        } else {
                            responseHeaders['Content-Encoding'] = 'gzip';
                            responseHeaders['Content-Length'] = compressed!.length.toString();
                            sendResponse(socket, '200 OK', responseHeaders, compressed!);
                        }
                    });
                } else {
                    responseHeaders['Content-Length'] = Buffer.byteLength(fileData).toString();
                    sendResponse(socket, '200 OK', responseHeaders, fileData);
                }
            }
        });
    } else {
        sendResponse(socket, '404 Not Found', {}, '');
    }
};

const handlePostRequest = (socket: any, path: string, headers: { [key: string]: string }, request: string) => {
    const directory = process.argv[3];
    const fileName = path.replace('/files/', '');
    const contentLength = parseInt(headers['Content-Length'], 10);
    const body = request.split('\r\n\r\n')[1].substring(0, contentLength);

    fs.writeFile(`${directory}/${fileName}`, body, 'utf8', (err) => {
        if (err) {
            console.error('File Write Error:', err);
            sendResponse(socket, '500 Internal Server Error', {}, '');
        } else {
            sendResponse(socket, '201 Created', {}, '');
        }
    });
};

const server = net.createServer((socket: any) => {
    socket.on("data", (data: any) => {
        handleRequest(socket, data.toString());
    });
});

server.listen(4221, "localhost");
