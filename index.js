let express = require('express')
let app = express();
let bodyParser = require('body-parser')
app.use(bodyParser.json());
let storage = require('node-storage');
var store = new storage('./Storage');
//you must first call storage.init


app.post('/:id', (req, res) => {
    let item = store.get(req.params.id);
    if (item == null) {
        item = [];
    }
    item.push(req.body[0])
    store.put(req.params.id, item);
    res.status(200).send();
})

app.get('/', (req,res)=>{
    res.sendFile(__dirname + "/public/index.html")
})

app.get('/geo', (req, res) => {
    let item = store.get('client3');
    let data = [];
    item.forEach(element => {
        data.push([element.longitude, element.latitude]);
    });
    res.json({
        geometry: {
            type: "LineString",
            coordinates: data
        },
        type: "Feature",
        properties: {}
    })
})



app.listen(process.env.PORT || 3000);