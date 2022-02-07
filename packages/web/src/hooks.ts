//import connect from '$lib/mongodb-client'

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	//request.locals.user = await getUserInformation(request.headers.cookie);
    //await connect()

    const path = event.url.pathname.replace(/\//, "")
    
    if(path === '' ) {
        console.log("rewrite path to map")
        event.url.pathname = `/map`
    } 

    const response = await resolve(event);
    if( path.includes("api/") ) {
        response.headers.set('Cache-Control', 'max-age=0, s-maxage=5, stale-while-revalidate=120');
    } else {    
        response.headers.set('Cache-Control', 'max-age=0, s-maxage=86400'); 
    }

    return response
}