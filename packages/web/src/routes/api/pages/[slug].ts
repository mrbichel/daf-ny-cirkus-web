
import _ from 'lodash'

//import { Location } from './_location.schema'
//import type { Page as PageType } from '../../../types'

import client from '../../../sanityClient'


/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {

    try {
        const data = await client.fetch(`*[slug.current == "${params.slug}"][0]{ 
            "slug": slug.current,
            ...}`)
        
        console.log("data")
        
        if(data.slug) {
            return { 
                body: data 
            }
        } else {
            return {
                status: 404,
                message: "Page not found" // TODO: hide in prod
            }
        }

    } catch (err) {
        console.error(err) // FIXME
        return {
            status: 500,
            message: err.message // TODO: hide in prod
        }
    }

}