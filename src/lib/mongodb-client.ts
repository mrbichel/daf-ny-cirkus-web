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

connect().catch(err => console.log(err));
async function connect() {
    if(mongoose.connection.readyState === 1) {
        return 
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

    await mongoose.connect(uri, options)
}


export default connect