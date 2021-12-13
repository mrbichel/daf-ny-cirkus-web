//import { Location } from './_location.schema'
import client from '../../../sanityClient'

import type { Location as LocationType } from '../../../types'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {

    //const loc = await Location.findOne({slug: params.slug})
    const loc = await client.fetch(`*[slug.current == "${params.slug}"][0]{
        _id,
        about,
        address,
        facebook,
        instagram,
        mail,
        phone,
        website}`)
         
    //console.log(params.slug)
    //console.log(loc)

    if(loc) {
        return { 
            body: loc
        }
    }

}