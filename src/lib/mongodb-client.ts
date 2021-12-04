import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose'

const uri = process.env['MONGODB_URI'];
if (!uri) {
    throw new Error('Please add your Mongo URI to .env')
}

const options = {
    logger: console.log,
    loggerLevel: process.env['NODE_ENV'] === 'development' ? 'debug' : 'warn',
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  }


if(process.env['NODE_ENV'] !== 'production') {
    mongoose.set('debug', process.env['NODE_ENV'] === 'development' )
}

mongoose.connection.on('error', e => {
    console.error(e)
})

mongoose.connection.once('open', () => {
    console.log(`mongoose successfully connected to ${uri}`)
})

connect().catch(err => console.log(err));
async function connect() {
    if(mongoose.connection.readyState === 1) {
        console.log("mongoose already connected")
        return 
    }

    await mongoose.connect(uri, options)
}

/*let connectionPromise
if (process.env['NODE_ENV'] === 'development') {
    // In development mode, use a global variable 
    // so that the value is preserved across module reloads 
    // caused by HMR (Hot Module Replacement).
    if (!global._mongooseConnectionPromise) {
        global.__mongooseConnectionPromise = connect()
    }
    connectionPromise = global.__mongooseConnectionPromise
} else {
    // In production mode, it's best to 
    // not use a global variable.
    connectionPromise = connect()
}*/


export default connect