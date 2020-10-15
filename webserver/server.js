const Database = require('./Database.js');
const UserUtils = require('./utilities/UserUtils.js');
const express = require('express');
const internalIp = require('internal-ip');
const jwt = require('jsonwebtoken');
const shajs = require('sha.js');
//const cors = require('cors');
const app = express();
const port = 3100;

Database.init();

app.use(express.json());
//app.use(cors());

// The following function can be uncommented for testing network delays
// Use 'await sleep(2000);' in the endpoint to add a 2 second delay
//function sleep(ms) {
//  return new Promise(resolve => setTimeout(resolve, ms));
//}

//app.get('/', (req, res) => {
//    res.redirect('/local/');
//});

app.use('/', express.static('webserver/static'));

app.get('/users', async (req, res) => {
    let users;
    let userIds = await Database.getOne("userIds");
    if(userIds) {
        users = await Database.getAll(userIds.ids);
        UserUtils.filterPersonalInformation(users);
    } else {
        users = [];
    }
    res.send({ data: users });
});

app.get('/user', async (req, res) => {
    let authRecord = UserUtils.getAuthRecord(req);
    if(!authRecord) {
        res.status(401);
        res.send({ "message": "Invalid Auth Token" });
        return;
    }
    let userId = authRecord.userId;
    let user = await Database.getOne(userId);
    if(user == null) {
        res.status(404);
        res.send();
        return;
    }
    delete user.password;
    res.send({ data: user });
});

app.post('/user', async (req, res) => {
    let body = req.body;
    if(body.isPasswordProtected) {
        body.password = shajs('sha256').update(body.password).digest('hex');
    }
    let record = await Database.createNew(req.body);
    //Update list of user ids
    let userIds = await Database.getOne("userIds");
    if(userIds == null) {
        userIds = { "_id": "userIds", "ids": [record._id] };
        await Database.createNew(userIds);
    } else {
        userIds.ids.push(record._id);
        await Database.updateOne("userIds", userIds);
    }
    res.send({ data: record });
});

app.delete('/user', async (req, res) => {
    let authRecord = UserUtils.getAuthRecord(req);
    if(!authRecord) {
        res.status(401);
        res.send({ "message": "Invalid Auth Token" });
        return;
    } else if(authRecord.userId != req.body.id) {
        res.status(403);
        res.send({ "message": "You do not have permission for this action" });
        return;
    }
    let result = await Database.delete(req.body.id);
    if(result) {
        res.send({});
    } else {
        res.status(404);
        res.send();
    }
});

app.get('/assets', async (req, res) => {
    let authRecord = UserUtils.getAuthRecord(req);
    if(!authRecord) {
        res.status(401);
        res.send({ "message": "Invalid Auth Token" });
        return;
    }
    let userId = authRecord.userId;
    let user = await Database.getOne(userId);
    if(!user) {
        res.status(404);
        res.send();
        return;
    }
    let assets = await Database.getAll(user.assetIds);
    assets.forEach((asset) => { asset['owners'] = null; });
    res.send({ data: assets });
});

app.post('/login', async (req, res) => {
    let body = req.body;
    let user = await Database.getOne(body.id);
    if(user.isPasswordProtected) {
        let hashedPassword = shajs('sha256').update(body.password).digest('hex');
        if(user.password != hashedPassword) {
            res.status(401);
            res.send();
            return;
        }
    }
    let jwtoken = jwt.sign({
        purpose: "authentication",
        userId: user._id
    }, 'gateway');
    res.send({ data: jwtoken });
});

app.get('/network-address', (req, res) => {
    let address = internalIp.v4.sync();
    if(address) {
        address = "http://" + address + ":" + port;
    }
    res.send({ data: address });
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
