const express = require('express')
var iwlist = require('wireless-tools/iwlist');
const path = require('path');


const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.get('/networks', async(req, res) => {
    const INTERFACE = 'wlx00c0ca970255'
    iwlist.scan(INTERFACE, function(err, networks) {
        console.log(networks);
        res.json(networks)
    });
})