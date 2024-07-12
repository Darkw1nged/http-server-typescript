# HTTP Server with Gzip Compression

This TypeScript application implements a simple HTTP server that supports handling GET and POST requests with gzip compression for certain endpoints. It's designed to serve basic file operations and echo functionalities while optionally compressing responses with gzip based on client preferences.

## Features

- **GET Requests**:
  - Handles `/echo/{str}`: Returns the provided `{str}` as plain text. Optionally compresses the response using gzip if the client requests it (`Accept-Encoding: gzip` header).
  - `/user-agent`: Returns the User-Agent header of the request.

- **POST Requests**:
  - Handles `/files/{filename}`: Saves the POST body content as a file named `{filename}` in a specified directory (provided during execution).

- **Error Handling**:
  - Properly responds with appropriate HTTP status codes and error messages for bad requests, file not found, internal server errors, and unsupported HTTP methods.

- **Gzip Compression**:
  - Supports gzip compression based on the `Accept-Encoding` header in GET request responses and appropriately sets the `Content-Encoding` header.

## Usage

1. **Setup**:
   - Clone this repository or download the source code files.

2. **Dependencies**:
   - Ensure TypeScript is installed globally or locally (`npm install -g typescript` or `npm install typescript`).

3. **Build**:
   - Navigate to the project directory containing `main.ts`.
   - Compile TypeScript files to JavaScript using:
     ```bash
     tsc main.ts
     ```

4. **Execution**:
   - Execute the compiled JavaScript file (`main.js`) with the following command:
     ```bash
     node main.js --directory /path/to/your/directory
     ```
     Replace `/path/to/your/directory` with the absolute path where you want the server to save files.

5. **Testing**:
   - Use a tool like `curl` to send GET and POST requests to test various endpoints.
   - Example GET request with gzip compression:
     ```bash
     curl -v -H "Accept-Encoding: gzip" http://localhost:4221/echo/abc
     ```
   - Example POST request to create a file:
     ```bash
     curl -v -X POST -d "File content" http://localhost:4221/files/newFile.txt
     ```

6. **Additional Notes**:
   - Ensure the server has appropriate permissions to read from and write to the specified directory.
   - This server currently supports gzip compression as specified. Future extensions may include additional compression methods based on client preferences (`Accept-Encoding` header).

## Considerations

- **Security**:
  - Implement additional security measures for handling user input and file operations in a production environment.
  - Validate input data and sanitize paths to prevent directory traversal attacks.

- **Performance**:
  - Evaluate performance implications of gzip compression, especially for large files and high-traffic servers.
  - Consider implementing caching mechanisms for improved performance.

- **Compatibility**:
  - Test with various client applications and browsers to ensure compatibility with different HTTP headers and methods.
