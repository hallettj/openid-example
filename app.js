'use strict';

var express = require('express')
  , app     = express()
;

app.get('/hello', function(req, res) {
    var body = 'Hello, world!';
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', body.length);
    res.end(body);
});

app.listen(3000);
console.log('Listening on port 3000');
