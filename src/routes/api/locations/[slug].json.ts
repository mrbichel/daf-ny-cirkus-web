import connect from '$lib/mongodb-client'
import { Location } from './_location.schema'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {
	await connect();

    const loc = await Location.findOne({slug: params.slug})

    if(loc) {
        return { 
            body: loc 
        }
    }

}