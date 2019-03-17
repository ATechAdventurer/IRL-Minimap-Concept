let express = require('express')
let app = express();
let bodyParser = require('body-parser')
app.use(bodyParser.json());
let storage = require('node-storage');
var dStore = new storage('./Storage');
var store = {'data': dStore.get('data')}


process.stdin.resume();//so the program will not close instantly

function exitHandler(options, exitCode) {
    if (options.cleanup) {dStore.put('data', store.data)};
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

app.use(express.static('public'))

app.post('/client/:id', (req, res) => { //Takes the client post data
    console.log("Client post");
    //let dataBuf = store.get('data')
    let {id} = req.params
    let {time, longitude, latitude, accuracy} = req.body[0];
    if(store.data[id] == null){
        store.data[id] = []
    }
    console.log(store.data[id]);
    store.data[id].push({time, longitude, latitude, accuracy})
    if(store.data[id].length >= 50){
        store.data[id].shift()
    }
    dStore.put('data', store.data);
    console.log("Pushing Data", store);
    res.status(200).send()
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html")
})

app.get('/api/allCurrent', (req, res) => {
    let dataHolder = {};
    for(client in store.data){
        let {longitude, latitude} = store.data[client][store.data[client].length - 1]
        dataHolder[client] = { longitude, latitude }
    }
    res.status(200).json(dataHolder)
})

app.get('/api/allcurrent/geo', (req, res) => {
    let structuredJSON = {
        "type" : "FeatureCollection",
        "features": []
    };
    
    let dataHolder = {};
    for(client in store.data){
        let {longitude, latitude} = store.data[client][store.data[client].length - 1]
        structuredJSON.features.push({ "type" : "Feature", "properties": {}, "geomentry": { "type": "Point", "coordinates": [longitude, latitude]}});
    }
    res.status(200).json(structuredJSON )
})

app.get('/api/allClients', (req, res) => {
    let clientList = [];
    for(client in store.data){
        clientList.push(client);
    }
    res.status(200).json(clientList)
})

app.get('/api/geo/:id', (req, res) => {
    let {id} = req.params
    let {longitude, latitude} = store.data[id][store.data[id].length - 1]

    res.status(200).json({ "geometry" : {"type": "Point", "coordinates": [longitude, latitude]}, "type": "Feature", "properties": { "iconUrl": "/icons/placeholder.png" } })
})

app.listen(3000)