import mongodb from 'mongodb';

const URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.lhmuq.mongodb.net/?retryWrites=true&w=majority`;
const COLLECTION = "favourites";
const CITIES_LIST_NAME = "cities";

let collection;

export function getCollection() {
    if (collection) {
        return Promise.resolve(collection);
    }
    const client = new mongodb.MongoClient(URI, { useUnifiedTopology: true });
    return client.connect().then(() => {
        collection = client.db(process.env.MONGO_DB).collection(COLLECTION);
        return collection;
    });
}

export function getCities(uuid) {
    return getCollection().then(collection => {
        return collection.findOne({uuid: uuid}).then(row => {
            if (!row) {
                console.debug('uuid is not knwon');
                return [];
            } else {
                console.debug('uuid is known');
                return row[CITIES_LIST_NAME];
            }
        })
    });
}

export function addCity(uuid, name) {
    return getCities(uuid).then(cities => {
        if (cities.includes(name)) {
            return false;
        }
        cities.push(name);
        return getCollection().then(collection => {
            collection.updateOne(
                {uuid: uuid},
                {$set: {uuid: uuid, cities: cities}},
                { upsert : true }
            );
            return true;
        })
    })
}

export function removeCity(uuid, name) {
    return getCities(uuid).then(cities => {
        return getCollection().then(collection => {
            collection.updateOne(
                {uuid: uuid},
                {$set: {uuid: uuid, cities: cities.filter(e => e !== name)}}
            );
        })
    })
}