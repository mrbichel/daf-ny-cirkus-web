import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose'

//import { MongoClient } from 'mongodb';

const uri = process.env['MONGODB_URI'];

const options = {
    logger: console.log,
    loggerLevel: 'debug',
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
  }

mongoose.connection.on('error', e => {
    console.error(e)
})

mongoose.connection.once('open', () => {
    console.log(`mongoose successfully connected to ${uri}`)
})

connect().catch(err => console.log(err));
async function connect() {
    if (!uri) {
        throw new Error('Please add your Mongo URI to .env')
    }

    mongoose.set('debug', true)

    await mongoose.connect(uri, options)

}



/*if (process.env['NODE_ENV'] === 'development') {
    // In development mode, use a global variable 
    // so that the value is preserved across module reloads 
    // caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
        client = mongoose.connect(uri, options);
        global._mongoClientPromise = client.connect()
    }
    connectionPromise = global._mongoClientPromise
} else {
    // In production mode, it's best to 
    // not use a global variable.
    client = new MongoClient(uri, options)
    connectionPromise = client.connect()
}*/

// Export a module-scoped MongoClient promise. 
// By doing this in a separate module, 
// the client can be shared across functions.
export default connect