
import _ from 'lodash'

//import { Location } from './_location.schema'
//import type { Page as PageType } from '../../../types'

import client from '../../../sanityClient'


/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {

    try {
        const data = await client.fetch(`*[_type == "page" && defined(slug.current)]{ 
            "slug": slug.current,
            title}`)
        
        return { 
            body: data 
        }


    } catch (err) {
        console.error(err) // FIXME
        return {
            status: 500,
            message: err.message // TODO: hide in prod
        }
    }

}