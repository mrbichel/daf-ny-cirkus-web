import { Location } from './_location.schema'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {

    const loc = await Location.findOne({slug: params.slug})

    if(loc) {
        return { 
            body: loc.toObject()
        }
    }

}