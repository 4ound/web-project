import mongodb from 'mongodb';

const URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.lhmuq.mongodb.net/?retryWrites=true&w=majority`;
const COLLECTION = "favourites";

let collection;

export function getCollection() {
    console.debug(collection);
    if (collection) {
        return Promise.resolve(collection);
    }
    const client = new mongodb.MongoClient(URI);
    return client.connect().then(() => {
        collection = client.db(process.env.MONGO_DB).collection(COLLECTION);
        return collection;
    });
}