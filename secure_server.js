const path = require('path')
const fs = require('fs')
// var express = require('express')
const https = require('https')

var certOptions = {
  key: fs.readFileSync(path.resolve('ssl/server.key')),
  cert: fs.readFileSync(path.resolve('ssl/server.crt'))
}

// var app = express()

/* app.get('/', function (req, res) {
  res.send('hello world')
}) */

/* app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/index.html'));
}) */

var server = https.createServer(certOptions, handleRequest).listen(443)
console.log('HTTPS server started');


function handleRequest(req, res) {
  // What did we request?
  var pathname = req.url;
  
  // If blank let's ask for index.html
  if (pathname == '/') {
    pathname = '/index.html';
  }
  
  // Ok what's our file extension
  var ext = path.extname(pathname);

  // Map extension to file type
  var typeExt = {
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.css':  'text/css'
  };
  // What is it?  Default to plain text

  var contentType = typeExt[ext] || 'text/plain';

  // User file system module
  fs.readFile(__dirname + pathname,
    // Callback function for reading
    function (err, data) {
      // if there is an error
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + pathname);
      }
      // Otherwise, send the data, the contents of the file
      res.writeHead(200,{ 'Content-Type': contentType });
      console.log('Serving: ' + pathname);
      res.end(data);
    }
  );
}
