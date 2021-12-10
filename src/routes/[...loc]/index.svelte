<script context="module" lang="ts">

	import { locationStore } from '$lib/stores'
	import _ from 'lodash'

    //export const prerender = false;
	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ page, fetch, session, stuff }) {

		console.log("load for route is run")
		const slug = page.params.loc

		/*let data
		const unsubscribe = locationStore.subscribe(d => {
			data = d;
		});*/

		//console.log(data)

		async function fetchAll() { // TODO: cache
			const url = '/api/locations'
			const res = await fetch(url)

			if(!res.ok) {
				return {
					status: res.status,
					error: new Error(`Could not load ${url}`)
				}
			}

			return await res.json()	
		}
			
		if(locationStore.isExpired() ) {
			const locations = await fetchAll()
        	locationStore.update(locations)
		}

		const props = {
			title: 'Ny Cirkus',
			location: undefined,
			locations: locationStore,	
			slug: slug
		}
		
		if(slug === '') {
			return {
				props
			}
		}

		/*if(!page.params.loc.match(/^[\w-]+$/)) {
			return {}
		}*/

		if(locationStore.isExpired(page.params.loc)) {
			const url = `/api/locations/${page.params.loc}`;
			const res = await fetch(url);

			if (res.ok) {		
				const loc = await res.json()
				locationStore.updateDetails(loc)
				
			} else {
				// TODO: render in locations popover
				return {
					status: res.status,
					error: new Error(`Could not load ${url}`)
				}
			}

		}
		const location = locationStore.getBySlug(slug)
		if(!location) {
			return {
					status: '404',
					error: new Error(`Location with slug ${slug} not found`)
				}
		}

		props.location = location
		props.title = props.location.n
		return { props };
	}
</script>   

<script lang="ts">

    export let title = "Ny Cirkus"
	export let location
	export let locations
	export let slug

	import { onMount } from 'svelte';
	import Map from '$lib/Map/Map.svelte'

	//let Map;
	onMount(async () => {
		/*const module = await import('$lib/Map/index.svelte');
		Map = module.default;*/
	});

	$: if(location) {
			locations.toggleExpand(location._id)
			//console.log("expand", location)
	} else {
			locations.toggleExpand()
			//console.log("close")
	}

</script>

<svelte:head>
	<title>{ title }</title>
</svelte:head>

<Map locations={$locations} expanded={location} />

<style lang="scss">		
</style>
	
