import mongoose from 'mongoose'
const { Schema } = mongoose
import { Point } from 'mongoose-geojson-schemas'

const locationSchema = new Schema({
    n: {type: String, required: true, alias: 'name'},
    slug: {type: String, required: true, unique: true},
    type: String,
    about: String,
    address: String,
    phone: String,
    email: String,
    mail: String,
    web: {type: String, alias: 'website'},
    fb: {type: String, alias: 'facebook'},
    ig: {type: String, alias: 'instagram'},
    loc: Point,
  },
  {
    timestamps: true 
  });

export const Location = mongoose.models.Location || mongoose.model('Location', locationSchema)