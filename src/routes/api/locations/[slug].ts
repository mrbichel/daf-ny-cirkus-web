import { Location } from './_location.schema'

import type { Location as LocationType } from '../../../types'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {

    const loc = await Location.findOne({slug: params.slug})

    if(loc) {
        const obj : LocationType = loc.toObject()

        return { 
            body: obj
        }
    }

}