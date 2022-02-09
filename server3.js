const http = require('http');
const https = require("https");
const fs = require('fs');
// options is used when we create an https server
const options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};
// busboy is for handing multipart form data
const busboy = require('busboy');
// we created a write stream from fs
const { createWriteStream } = require("fs");
// streamifier is used when we have to create a read stream on buffer of data
// generally argument to streamifier is a file path
const streamifier = require('streamifier');

const server = http.createServer();

server.on('request', (req, res) => {
    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200);
        res.end("Server running!");
    }
    else if (req.method === "POST" && req.url === "/post") {
        // creting an instance of busboy
        // In older version of it we used to call it as constructor but in new versions if we call
        // it as constructor it will throw an error
        // try {
        const bb = busboy({ headers: req.headers });
        // we are listening on file event on busboy instance we've created
        console.log("opening busboy....");
        bb.on('file', function (fieldname, file, filename, encoding, mimetype) {
            //this part is for streaming data that we are receiving from client
            // I dont understand it completely though got work on it
            // file parameter in here is a stream so we can pipe it
            file.on('data', function (data) {
                console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
            });
            // this is for ending the stream
            file.on('end', function () {
                console.log('File [' + fieldname + '] Finished');
            });
            let outStream = createWriteStream('./user.json');
            // appending data to out write stream
            file.pipe(outStream);
        });
        // finishing the busboy
        bb.on('finish', function () {
            res.writeHead(200, { 'Connection': 'close' });
            res.end("That's all folks!");
        });
        return req.pipe(bb);
    }
});
// workflow:
// whole process will start when req.pipe(bb) is executed
// 1)busboy will listen on its file event
// 2)file will listen on data event untill it does fire end event
// 3)after firing end event reading is terminated
// 4) after ending it fire 'finish' event on busboy

server.listen(5000, 'localhost', () => {
    console.log("server up and running!!");
});