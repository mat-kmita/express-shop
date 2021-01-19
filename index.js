const express = require('express');
const http = require('http');

let app = express();
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
    res.end("Hello!");
});


http.createServer(app).listen(3000);