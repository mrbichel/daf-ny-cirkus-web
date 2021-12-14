//import connect from '$lib/mongodb-client'

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ request, resolve }) {
	//request.locals.user = await getUserInformation(request.headers.cookie);
    //await connect()

    const extraHeaders = {
        'Cache-control': 'max-age=0, s-maxage=86400'
    }

    const path = request.path.replace(/\//, "")
    
    if(path === '' ) {
        console.log("rewrite path to map")
        request.path = `/map`
    } 
    
    if( path.includes("api/") ) {
        extraHeaders['Cache-Control'] = 'max-age=0, s-maxage=5, stale-while-revalidate=120'
    }

    /*if(request.path === '/service-worker.js') {
        return
    }*/

	const response = await resolve(request);

	return {
		...response,
		headers: {
			...response.headers,
            ...extraHeaders
		}
	};
}