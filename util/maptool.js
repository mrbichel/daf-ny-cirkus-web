import * as turf from '@turf/turf'
import tag from '@turf/tag';

import fs from 'fs'
//import buildings from './buildings.geo.json'

import StreamValues from 'stream-json/streamers/StreamValues.js'
//const { StreamValues } = pkg
import { locations } from './src/locations.js'

//console.log(StreamValues)

const pipeline = fs.createReadStream('./buildings.geo.json').pipe(StreamValues.withParser());

//You'll get json objects here
//Key is the array-index here
let currentObject;
pipeline.on('data', data => console.log(data));

pipeline.on('end', () => {
    console.log('All Done');
});




/*
const points = turf.featureCollection(locations.map((l) => {
    return turf.point([l.lat, l.lon])
}))

var polygons = turf.featureCollection(buildings.features);


var tagged = tag(points, polygons, 'hascircus');

console.log(tagged)
*/