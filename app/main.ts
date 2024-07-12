import * as net from "net";
import * as fs from "fs";
import * as process from "process";

const server = net.createServer((socket: any) => {
    socket.on("data", (data: any) => {
        const request = data.toString();
        const path = request.split(" ")[1];
        const query = path.split("/")[2];

        // console.log(path);
        // console.log(query);

        if (path === '/') {
            socket.write('HTTP/1.1 200 OK\r\n\r\n');
        } else if (path === `/echo/${query}`) {
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${query.length}\r\n\r\n${query}`);
        } else if (path === '/user-agent') {
            const userAgent = request.split('User-Agent: ')[1].split('\r\n')[0];
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`);
        } else if (path === '/files/') {
            const directory = process.argv[3];
            const fileName = query;

            console.log('[debug]' + directory);
            console.log('[debug]' + fileName);

            fs.readFile(`${directory}${fileName}`, 'utf8', (err: Error, data: string) => {
                if (err) {
                    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
                }
                socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${data.length}\r\n\r\n${data}`);
            });

        }



        else {
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        }

        socket.end();
    });
});

server.listen(4221, "localhost");
