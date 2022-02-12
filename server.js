const express = require('express');
const path = require('path');
const app = express();
 
app.use(express.static(path.join(__dirname, './')));
 
var server = app.listen(8081, '0.0.0.0',function () {
    var port = server.address().port
    console.log("http://localhost:%s", port)
})