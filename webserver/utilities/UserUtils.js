const jwt = require('jsonwebtoken');

class UserUtils {
    filterPersonalInformation(users) {
        for(let i = 0; i < users.length; i++) {
            let publicUserInfo = {
                '_id': users[i]['_id'],
                'name': users[i]['name'],
                'isPasswordProtected': users[i]['isPasswordProtected'],
            }
            users[i] = publicUserInfo;
        }
    }

    getAuthRecord(req) {
        let jwtoken = req.headers.authorization;
        if(jwtoken) {
            try {
                let authRecord = jwt.verify(jwtoken, "gateway");
                return authRecord;
            } catch (err) {
                return null;
            }
        }
        return null;
    }
}

let userUtils = new UserUtils();

module.exports = userUtils;
