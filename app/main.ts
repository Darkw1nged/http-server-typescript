import * as net from "net";
import * as fs from "fs";
import * as process from "process";

const server = net.createServer((socket: any) => {
    socket.on("data", (data: any) => {
        const request = data.toString();
        const path = request.split(" ")[1];
        path.shift();

        const query = path.split("/")[1];

        if (path === '/') {
            socket.write('HTTP/1.1 200 OK\r\n\r\n');
        } else if (path === `/echo/${query}`) {
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${query.length}\r\n\r\n${query}`);
        } else if (path === '/user-agent') {
            const userAgent = request.split('User-Agent: ')[1].split('\r\n')[0];
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`);
        } else if (path[0] === 'files') {
            const directory = process.argv[3];
            const fileName = path[1];

            fs.readFile(directory + fileName, 'utf8', (err: Error, fileData: string) => {
                if (err) {
                    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
                }
                socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileData.length}\r\n\r\n${fileData}`);
            })

        }



        else {
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        }

        socket.end();
    });
});

server.listen(4221, "localhost");
