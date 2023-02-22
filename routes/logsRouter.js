const logService = require('../services/logsService');
const express = require('express');

const router = express.Router();

router.post('/', (req, res) => {
    logService.handleLog(req, res);
});

router.get('/', async (req, res) => {
    let result = await logService.getAllLogs();
    if(result)
        return res.send(result);
    return res.status(404).json({'message':'log not found'})
});

router.get('/count', async (req, res) => {
    let result = await logService.getLogNumber();
    if(result)
        return res.send(String(result));
    return res.status(404).json({'message':'log not found'})
});

router.get('/title/:title', async (req, res) => {
    let result = await logService.findLogByTitle(req.params.title);
    if(result)
        return res.send(String(result));
    return res.status(404).json({'message':'log not found'})
});

module.exports = router;