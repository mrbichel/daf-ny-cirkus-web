
import _ from 'lodash'
//import slug from 'slug'

//import { Location } from './_location.schema'
import type { Location as LocationType } from '../../../types'

import client from '../../../sanityClient'

import { geoDistance } from 'd3-geo'

//import sanityClient from '@sanity/client'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {

    try {

        const data = await client.fetch(`*[_type == "location" && defined(slug.current) && defined(location)]{
            _id, 
            title, 
            location, 
            "category": category->slug.current, 
            "slug": slug.current}`)
        
        const locations = data.map(d => {

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
    

    //const result = await Location.find({loc: { $ne: null } }, 'n slug loc type' )

    // TODO: reverse address lookup if loc is missing
    //const objects : LocationType[] = result.map(d => d.toObject())
    //const locations = objects

    /*const locations = objects.map(d => {

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

        return d
    })*/

    //console.log(locations)
    // 

    /*const update_dates = locations.map( (l) => {
        return l.update({createdAt: l.updatedAt})
    })
    const result = await Promise.all(update_dates)
    console.log(result)*/

}