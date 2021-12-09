import { Location } from './_location.schema'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {

    const loc = await Location.findOne({slug: params.slug})

    if(loc) {
        const obj : location = loc.toObject()
        obj.lastFetched = new Date()
        obj.lastFetchedDetail = new Date()

        return { 
            body: obj
        }
    }

}