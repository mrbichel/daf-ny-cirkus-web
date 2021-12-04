import connect from '$lib/mongodb-client'

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ request, resolve }) {
	//request.locals.user = await getUserInformation(request.headers.cookie);
    await connect()

    const path = request.path.replace(/\//, "")
    if(path === '' || path.match(/^[\w-]+$/) ) {
        request.path = `/${path}`
    } 

    /*if(request.path === '/service-worker.js') {
        return
    }*/

	const response = await resolve(request);
    

	return {
		...response,
		headers: {
			...response.headers,
            'Cache-Control': 'max-age=0, s-maxage=86400'
		}
	};
}