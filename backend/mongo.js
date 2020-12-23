import mongodb from 'mongodb';

export class Database {
    static URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.lhmuq.mongodb.net/?retryWrites=true&w=majority`;
    static COLLECTION = "favourites";
    static CITIES_LIST_NAME = "cities";

    static collection;

    static getCollection() {
        if (collection) {
            return Promise.resolve(collection);
        }
        const client = new mongodb.MongoClient(this.URI, { useUnifiedTopology: true });
        return client.connect().then(() => {
            this.collection = client.db(process.env.MONGO_DB).collection(this.COLLECTION);
            return collection;
        });
    }

    static getCities(uuid) {
        return this.getCollection().then(collection => {
            return collection.findOne({uuid: uuid}).then(row => {
                if (!row) {
                    console.debug('uuid is not known');
                    return [];
                } else {
                    console.debug('uuid is known');
                    return row[this.CITIES_LIST_NAME];
                }
            })
        });
    }

    static addCity(uuid, name) {
        return this.getCities(uuid).then(cities => {
            if (cities.includes(name)) {
                return false;
            }
            cities.push(name);
            return this.getCollection().then(collection => {
                collection.updateOne(
                    {uuid: uuid},
                    {$set: {uuid: uuid, cities: cities}},
                    { upsert : true }
                );
                return true;
            })
        })
    }

    static removeCity(uuid, name) {
        return this.getCities(uuid).then(cities => {
            return this.getCollection().then(collection => {
                collection.updateOne(
                    {uuid: uuid},
                    {$set: {uuid: uuid, cities: cities.filter(e => e !== name)}}
                );
            })
        })
    }
}