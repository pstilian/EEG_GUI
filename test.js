// var express = require('express');
// var app = express();
// var path = require('path');
var http = require('http');
var fs = require('fs');
//
// app.get('/', function(req, res){
//   res.sendFile(path.join(__dirname + '/index.html'));
// });
//
// app.listen(8080);

// Create server and display index.html
var server = http.createServer(function(req, res){
  console.log('request was made: ' + req.url);
  res.writeHead(200, {'Content-Type': 'text/html'});
  var myReadStream =fs.createReadStream(__dirname + '/index.html', 'utf8');
  myReadStream.pipe(res);
});

// Sets the IP and port for the server to listen to.
server.listen(6868, '127.0.0.1');
console.log('now listening to port 6868');
