
import _ from 'lodash'
//import slug from 'slug'

import { Location } from './_location.schema'
import { geoDistance } from 'd3-geo'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {

    const result = await Location.find({loc: { $ne: null } }, 'n slug loc type' )

    // TODO: reverse address lookup if loc is missing
    const objects : location[] = result.map(d => d.toObject())
    //const locations = objects

    const locations = objects.map(d => {

    // calculate closest neighbour for new elements
        const neighbours = objects.filter(n => n._id != d._id).map( n => {
            return {
                dist: geoDistance(n.loc.coordinates, d.loc.coordinates),
                loc: n.loc,
                _id: n._id
            }
        })
        //console.log(neighbours)

        //d.closestNeighbours = _.sortBy( neighbours, 'distance');
        d.closestNeighbour = _.sortBy( neighbours, 'dist')[0];
        d.lastFetched = new Date()

        return d
    })

    //console.log(locations)
    // 

    /*const update_dates = locations.map( (l) => {
        return l.update({createdAt: l.updatedAt})
    })
    const result = await Promise.all(update_dates)
    console.log(result)*/

    if(locations) {
        return { 
            body: locations 
        }
    }

}