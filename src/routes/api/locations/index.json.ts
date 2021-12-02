
import _ from 'lodash'
import slug from 'slug'
//const { _ } = lodash_pkg;  

import connect from '$lib/mongodb-client'
import { Location } from './_location.schema'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {
    await connect();

    // TODO: reverse address lookups
    const locations = await Location.find({loc: { $ne: null } }, 'n slug loc type' ) // 

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