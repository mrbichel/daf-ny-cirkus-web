import {locations as location_data } from "../locations.js";

import _ from 'lodash'
import slug from 'slug'
//const { _ } = lodash_pkg;  

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {

	// the `slug` parameter is available because this file
	// is called [slug].json.js 

    const loc = _.find(location_data, (d) => {  
        return slug(d.name) === params.slug
    })

    if(loc) {
        return { 
            body: loc 
        }
    }

    /*
	const article = await db.get(slug);

	if (article) {
		return {
			body: {
				article
			}
		};
	}*/
}