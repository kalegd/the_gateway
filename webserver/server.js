const Database = require('./Database.js');
const express = require('express');
const internalIp = require('internal-ip');
const jwt = require('jsonwebtoken');
const shajs = require('sha.js');
const app = express();
const port = 3100;

Database.init();

app.use(express.json());

app.get('/', (req, res) => {
    res.redirect('/local/');
});

app.use('/local', express.static('webserver/static'));

app.get('/users', async (req, res) => {
    let users;
    let userIds = await Database.getOne("userIds");
    if(userIds) {
        users = await Database.getAll(userIds.ids);
    } else {
        users = [];
    }
    res.send({ data: users });
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
    let result = await Database.delete(req.body.id);
    if(result) {
        res.send({});
    } else {
        res.status(404);
        res.send();
    }
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
