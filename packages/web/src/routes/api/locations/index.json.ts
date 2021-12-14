
import _ from 'lodash'

//import { Location } from './_location.schema'
import type { Location as LocationType } from '../../../types'

import client from '../../../sanityClient'
import { geoDistance } from 'd3-geo'

// TODO: reverse address lookups

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {

    try {

        const data = await client.fetch(`*[_type == "location" && defined(slug.current) && defined(location)]{
            _id, 
            title, 
            location, 
            "category": category->slug.current, 
            "slug": slug.current}`)
        
        const locations : LocationType[] = data.map(d => {

            // calculate closest neighbour for new elements
                const neighbours = data.filter(n => n._id != d._id).map( n => {
                    return {
                        distance: geoDistance([n.location.lng, n.location.lat], [d.location.lng, d.location.lat]),
                        location: n.location,
                        _id: n._id
                    }
                })
                //console.log(neighbours)
        
                //d.closestNeighbours = _.sortBy( neighbours, 'distance');
                d.closestNeighbour = _.sortBy( neighbours, 'dist')[0];
                return d
            })

        return { 
            body: locations 
        }


    } catch (err) {
        console.error(err) // FIXME
        return {
            status: 500,
            message: err.message // TODO: hide in prod
        }
    }

}