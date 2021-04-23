const Database = require('./Database.js');
const SketchfabUtils = require('./utilities/SketchfabUtils.js');
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
    let webworld = await Database.createNew({ "assets": {}, "name": "Default"});
    let body = req.body;
    if(body.isPasswordProtected) {
        body.password = shajs('sha256').update(body.password).digest('hex');
    }
    body.sketchfabAPIToken = "";
    body.library = { "assets": [] };
    body.webworlds = [webworld._id];
    body.defaultWebworld = webworld._id;
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
    let jwtoken = jwt.sign({
        purpose: "authentication",
        userId: record._id
    }, 'gateway');
    res.send({ data: { user: record, jwt: jwtoken }});
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
    let result = await Database.deleteOne(req.body.id);
    if(result) {
        res.send({});
    } else {
        res.status(404);
        res.send();
    }
});

app.get('/user/info', async (req, res) => {
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
    let webworldIds = user.webworlds;
    let webworlds = await Database.getAll(webworldIds);
    let assetIds = user.library.assets.map(asset => asset.assetId);
    let assets = await Database.getAll(assetIds);
    assets.forEach((asset) => { delete asset.owners });
    res.send({ data: { user: user, assets: assets, webworlds: webworlds } });
});

app.put('/user/defaultWebworld', async (req, res) => {
    let authRecord = UserUtils.getAuthRecord(req);
    if(!authRecord) {
        res.status(401);
        res.send({ "message": "Invalid Auth Token" });
        return;
    } else if(authRecord.userId != req.body.userId) {
        res.status(403);
        res.send({ "message": "You do not have permission for this action" });
        return;
    } else if(!req.body.webworldId) {
        res.status(422);
        res.send({ "message": "Missing parameter 'webworldId'" });
        return;
    }
    let userId = authRecord.userId;
    let user = await Database.getOne(userId);
    let webworld = await Database.getOne(req.body.webworldId);
    if(user == null || webworld == null) {
        res.status(404);
        res.send();
        return;
    }
    user.defaultWebworld = webworld._id;
    await Database.updateOne(user._id, user);
    res.send({});
});

app.post('/user/webworld', async (req, res) => {
    let authRecord = UserUtils.getAuthRecord(req);
    if(!authRecord) {
        res.status(401);
        res.send({ "message": "Invalid Auth Token" });
        return;
    } else if(authRecord.userId != req.body.userId) {
        res.status(403);
        res.send({ "message": "You do not have permission for this action" });
        return;
    } else if(!req.body.name) {
        res.status(422);
        res.send({ "message": "Missing parameter 'name'" });
        return;
    }
    let userId = authRecord.userId;
    let user = await Database.getOne(userId);
    if(user == null) {
        res.status(404);
        res.send();
        return;
    }
    let webworld;
    if(req.body.webworldId) {
        let progenitor = await Database.getOne(req.body.webworldId);
        progenitor['name'] = req.body.name;
        delete progenitor['_id'];
        webworld = await Database.createNew(progenitor);
    } else {
        webworld = await Database.createNew(
            { "assets": {}, "name": req.body.name });
    }
    user.webworlds.push(webworld._id);
    if(user.webworlds.length == 1) {
        user.defaultWebworld = webworld._id;
    }
    await Database.updateOne(userId, user);
    res.send({ data: webworld });
});

app.put('/user/webworld', async (req, res) => {
    let authRecord = UserUtils.getAuthRecord(req);
    if(!authRecord) {
        res.status(401);
        res.send({ "message": "Invalid Auth Token" });
        return;
    } else if(authRecord.userId != req.body.userId) {
        res.status(403);
        res.send({ "message": "You do not have permission for this action" });
        return;
    } else if(!req.body.webworld) {
        res.status(422);
        res.send({ "message": "Missing parameter 'webworld'" });
        return;
    }
    let webworld = await Database.getOne(req.body.webworld._id);
    if(webworld == null) {
        res.status(404);
        res.send();
        return;
    }
    await Database.updateOne(webworld._id, req.body.webworld);
    res.send({});
});

app.delete('/user/webworld', async (req, res) => {
    let authRecord = UserUtils.getAuthRecord(req);
    if(!authRecord) {
        res.status(401);
        res.send({ "message": "Invalid Auth Token" });
        return;
    } else if(authRecord.userId != req.body.userId) {
        res.status(403);
        res.send({ "message": "You do not have permission for this action" });
        return;
    } else if(!req.body.webworldId) {
        res.status(422);
        res.send({ "message": "Missing parameter 'webworldId'" });
        return;
    }
    let userId = authRecord.userId;
    let user = await Database.getOne(userId);
    let webworld = await Database.getOne(req.body.webworldId);
    if(user == null || webworld == null) {
        res.status(404);
        res.send();
        return;
    }
    user.webworlds = user.webworlds.filter(
        webworldId => webworldId != webworld._id);
    if(user.defaultWebworld == webworld._id) {
        user.defaultWebworld = (user.webworlds.length > 0)
            ? user.webworlds[0]
            : null;
    }
    await Database.updateOne(userId, user);
    await Database.deleteOne(webworld._id);
    res.send({});
});

app.put('/user/sketchfab', async (req, res) => {
    let authRecord = UserUtils.getAuthRecord(req);
    if(!authRecord) {
        res.status(401);
        res.send({ "message": "Invalid Auth Token" });
        return;
    } else if(authRecord.userId != req.body.userId) {
        res.status(403);
        res.send({ "message": "You do not have permission for this action" });
        return;
    }
    let userId = authRecord.userId;
    let user = await Database.getOne(userId);
    if(user == null) {
        res.status(404);
        res.send();
        return;
    }
    user.sketchfabAPIToken = req.body.apiToken;
    await Database.updateOne(userId, user);
    res.send({});
});

app.post('/user/sketchfab/model', async (req, res) => {
    let authRecord = UserUtils.getAuthRecord(req);
    if(!authRecord) {
        res.status(401);
        res.send({ "message": "Invalid Auth Token" });
        return;
    } else if(authRecord.userId != req.body.userId) {
        res.status(403);
        res.send({ "message": "You do not have permission for this action" });
        return;
    } else if(!req.body.sketchfabUid) {
        res.status(422);
        res.send({ "message": "Missing parameter 'sketchfabUid'" });
        return;
    }
    let userId = authRecord.userId;
    let sketchfabUid = req.body.sketchfabUid;
    let user = await Database.getOne(userId);
    if(user == null) {
        res.status(404);
        res.send();
        return;
    }
    let asset = await Database.getOne(sketchfabUid);
    if(asset != null) {
        for(let i = 0; i < user.library.assets.length; i++) {
            if(user.library.assets[i].id == asset.uid) {
                //console.log("User already has this asset");
                delete asset.owners;
                res.send({ data: asset });
                return;
            }
        }
        //console.log("Asset already exists, adding for user");
        user.library.assets.push({
            assetId: asset._id,
            name: asset.name
        });
        asset.owners.push(userId);
        await Database.updateOne(user._id, user);
        await Database.updateOne(asset._id, asset);
        delete asset.owners;
        res.send({ data: asset });
        return;
    }
    //console.log("About to download stuff");
    SketchfabUtils.downloadAndSave(
        req.body.sketchfabUid,
        user.sketchfabAPIToken,
        async (modelInfo, filepaths) => {
            asset = {
                _id: modelInfo.uid,
                filepath: filepaths[0],
                smallPreviewImage: filepaths[1],
                mediumPreviewImage: filepaths[2],
                name: modelInfo.name,
                source: "SKETCHFAB",
                type: "MODEL",
                modelType: "GLTF",
                owners: [userId],
            };
            //Refetch latest user info in case updates occured while downloading
            user = await Database.getOne(userId);
            user.library.assets.push({
                assetId: modelInfo.uid,
                name: modelInfo.name
            });
            await Database.createNew(asset);
            await Database.updateOne(user._id, user);
            delete asset.owners;
            res.send({ data: asset });
        },
        (statusOverride) => {
            res.status((statusOverride) ? statusOverride : 503);
            res.send();
            return;

        });
});

app.delete('/user/asset', async (req, res) => {
    let authRecord = UserUtils.getAuthRecord(req);
    if(!authRecord) {
        res.status(401);
        res.send({ "message": "Invalid Auth Token" });
        return;
    } else if(authRecord.userId != req.body.userId) {
        res.status(403);
        res.send({ "message": "You do not have permission for this action" });
        return;
    } else if(!req.body.assetId) {
        res.status(422);
        res.send({ "message": "Missing parameter 'webworldId'" });
        return;
    }
    let userId = authRecord.userId;
    let user = await Database.getOne(userId);
    let asset = await Database.getOne(req.body.assetId);
    if(user == null || asset == null) {
        res.status(404);
        res.send();
        return;
    }
    let webworldIds = user.webworlds;
    let webworlds = await Database.getAll(webworldIds);
    user.library.assets = user.library.assets.filter(
        libraryAsset => libraryAsset.assetId != asset._id);
    asset.owners = asset.owners.filter(ownerId => ownerId != userId);
    await Database.updateOne(userId, user);
    await Database.updateOne(asset._id, asset);
    for(let webworld of webworlds) {
        if(asset._id in webworld.assets) {
            delete webworld.assets[asset._id];
            await Database.updateOne(webworld._id, webworld);
        }
    }
    res.send({});
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
    res.send({ data: { jwt: jwtoken, user: user }});
});

app.get('/network-address', (req, res) => {
    let address = internalIp.v4.sync();
    if(address) {
        address = "http://" + address + ":" + port;
    }
    res.send({ data: address });
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
