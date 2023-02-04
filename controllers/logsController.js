const express = require('express');
const logService = require('../services/logsService');

const logsController = express();

logsController.post('/', (req, res) => {
    logService.handleLog(req, res);
});

logsController.get('/', async (req, res) => {
    let result = await logService.getAllLogs();
    if(result)
        return res.send(result);
    return res.status(404).json({'message':'log not found'})
});

logsController.get('/count', async (req, res) => {
    let result = await logService.getLogNumber();
    if(result)
        return res.send(String(result));
    return res.status(404).json({'message':'log not found'})
});

logsController.get('/title/:title', async (req, res) => {
    let result = await logService.findLogByTitle(req.params.title);
    if(result)
        return res.send(String(result));
    return res.status(404).json({'message':'log not found'})
});

module.exports = logsController;