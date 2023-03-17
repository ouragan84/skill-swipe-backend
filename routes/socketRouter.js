// const { default: mongoose } = require('mongoose');
const socketio = require('socket.io');
const auth = require('../hooks/authMiddleware');
const matchMaker = require('../services/matchMaker');
const chatHandler = require('../services/chatHandler');

const express = require('express');
const userProfileSchema = require('../models/userProfile');
const positionSchema = require('../models/position');
const companyProfileSchema = require('../models/companyProfile');


const router = express.Router();

let io;

const onlineUsers = new Map();
const onlineUsersReversed = new Map();//map < String: socket.Id,  {isTypeUser: Boolean, consumerId: mongoose.Types.ObjectId, id: mongoose.Types.ObjectId} >

const checkIsAuthenticated = async (socketId, data) => { 
    try {
        const consumer = await auth.getConsumerFromSessionToken(data.headers);

        if(!consumer.isEmailConfrimed)
          throw new Error("Cannot authenticate consumer, email is not verrified")
    
        if(!consumer.isAccountComplete)
          throw new Error("Cannot authenticate consumer, account is not complete")

        onlineUsers.set(socketId, {isTypeUser: consumer.isTypeUser, consumerId: consumer._id, id: consumer.profileId});
        onlineUsersReversed.set(consumer.profileId, socketId);

        return io.to(socketId).emit('connection-success', err.message);

    } catch (err) {
        return io.to(socketId).emit('connection-failed', err.message);
    }
}

const createSocket = (server) => {
    console.log("creating Socket")

    io = socketio(server, {cors: {origin: '*'}})

    io.on('connection', (socket) => {
        console.log("USER CONNECTED:", socket.id);

        onlineUsers.set(socket.id, {id: null, consumerId: null, isTypeUser:null});

        socket.on('login', (data) => {
            console.log("USER LOGIN:", socket.id, data.headers.authorization);

            checkIsAuthenticated(socket.id, data);
        })
        
        socket.on('disconnect', (reason) => {
            console.log("USER DISCONNECTED:", socket.id, reason);
            const id = onlineUsers.get(socket.id).id;
            onlineUsers.delete(socket.id);
            onlineUsersReversed.delete(id);
        });
    });
}

const checkUser = async (req, res, next) => {
    if(!req.consumer.isTypeUser)
        return res.status(401).send({'status': 'failure', 'message': 'method reserved for user'});
    req.user = await userProfileSchema.findById(req.consumer.profileId);
    next();
}

const checkPosition = async (req, res, next) => {
    if(req.consumer.isTypeUser)
        return res.status(401).send({'status': 'failure', 'message': 'method reserved for companies'});
    req.company = await companyProfileSchema.findById(req.consumer.profileId);
    req.position = await positionSchema.findById(req.company.positions[Number(req.params.index)]); // make sure to add index in body
    if(!req.position)
        return res.status(401).send({'status': 'failure', 'message': 'position not found'});
    next();
}

router.use('/user/get/cards', auth.checkConsumerCompleteAuth, checkUser)
router.get('/user/get/cards', async (req, res) => {
    // const position = await positionSchema.findById(req.body.positionId);
    const ret = await matchMaker.getListPositions(req.user);
    res.status(200).send({'status': 'success', 'message': 'method successful', 'cards': ret});
});

router.use('/user/reject/position', auth.checkConsumerCompleteAuth, checkUser)
router.post('/user/reject/position', async (req, res) => {
    let position = await positionSchema.findById(req.body.positionId);
    await matchMaker.rejectPosition(req.user, position);
    // io.to(onlineUsersReversed.get(position.information.companyId)).emit('remove-match');
    res.status(200).send({'status': 'success', 'message': 'successfully rejected position'});
});

router.use('/user/apply/position', auth.checkConsumerCompleteAuth, checkUser)
router.post('/user/apply/position', async (req, res) => {
    let position = await positionSchema.findById(req.body.positionId);
    await matchMaker.applyToPosition(req.user, position);
    // io send update to company
    if(onlineUsersReversed.has(position.information.companyId))
        io.to(onlineUsersReversed.get(position.information.companyId)).emit('new-applicant');
    res.status(200).send({'status': 'success', 'message': 'successfully applied to position'});
});

router.use('/company/get/cards/:index', auth.checkConsumerCompleteAuth, checkPosition)
router.get('/company/get/cards/:index', async (req, res) => {
    // const user = await userProfileSchema.findById(req.body.userId);
    const ret = matchMaker.getListUsers(req.position);
    console.log(`/company/get/cards/${req.params.index} returned:`, ret)
    res.status(200).send({'status': 'success', 'message': 'method successful', 'cards': ret});
});

router.use('/company/reject/applicant/:index', auth.checkConsumerCompleteAuth, checkPosition)
router.post('/company/reject/applicant/:index', async (req, res) => {
    let user = await userProfileSchema.findById(req.body.userId);
    matchMaker.rejectApplicant(req.position, user);
    // io.to(onlineUsersReversed.get(user._id)).emit('remove-match');
    res.status(200).send({'status': 'success', 'message': 'successfully accepted applicant'});
});

router.use('/company/accept/applicant/:index', auth.checkConsumerCompleteAuth, checkPosition)
router.post('/company/accept/applicant/:index', async (req, res) => {
    let user = await userProfileSchema.findById(req.body.userId);
    matchMaker.acceptApplicant(req.position, user);
    // io send update to user
    if(onlineUsersReversed.has(user._id))
        io.to(onlineUsersReversed.get(user._id)).emit('new-match');
    res.status(200).send({'status': 'success', 'message': 'successfully rejected applicant'});
});



module.exports = {createSocket, router};