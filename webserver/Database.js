const Datastore = require('nedb-promises');
const { uuid } = require('uuidv4');


class Database {
    constructor() {
    }

    init() {
        this._db = new Datastore({ filename: 'database' });
    }

    async createNew(record) {
        if(!('_id' in record)) {
            record['_id'] = uuid();
        }
        try {
            let newRecord = await this._db.insert(record);
            return newRecord;
        } catch {
            return null;
        }
    }

    async getOne(id) {
        let result = await this._db.findOne({ _id: id });
        return result;
    }

    async getAll(ids) {
        let result = await this._db.find({ _id: { $in: ids }});
        return result;
    }

    async updateOne(id, record) {
        let result = await this._db.update({ _id: id}, record);
        return result;
    }

    async deleteOne(id) {
        let result = await this._db.remove({ _id: id });
        return result;
    }

}

let database = new Database();

module.exports = database;
