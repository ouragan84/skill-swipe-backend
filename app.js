const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const app = express();
const logService = require('./controllers/logsController')
const PORT = 3000;

logService.connectDB();

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:19006'
}));

app.get('/', (req, res) => {
    res.send('Hello from Node.js');
});

app.post('/log', (req, res) => {
    logService.handleLog(req, res);
});

app.get('/log', async (req, res) => {
    let result = await logService.getAllLogs();
    if(result)
        return res.send(result);
    return res.status(404).json({'message':'log not found'})
});

app.get('/log/count', async (req, res) => {
    let result = await logService.getLogNumber();
    if(result)
        return res.send(String(result));
    return res.status(404).json({'message':'log not found'})
});

app.get('/log/title/:title', async (req, res) => {
    let result = await logService.findLogByTitle(req.params.title);
    if(result)
        return res.send(String(result));
    return res.status(404).json({'message':'log not found'})
});

mongoose.connection.once('open', () => {
    console.log('Connected to mongoDB')
    app.listen(3000, ()=>{
        console.log('Server started on port ' + PORT);
    });
})