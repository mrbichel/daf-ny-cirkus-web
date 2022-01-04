<script context="module" lang="ts">

	import { locationStore } from '$lib/stores'
	import _ from 'lodash'

    //export const prerender = false;
	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ url, params, fetch, session, stuff }) {
		const slug = params.slug

		if(locationStore.isExpired() ) {
			const url = '/api/locations.json'
			const res = await fetch(url)

			if(!res.ok) {
				return {
					status: res.status,
					error: new Error(`Could not load ${url}`)
				}
			}

			const locations = await res.json()
        	locationStore.update(locations)
		}

		const props = {
			title: 'Ny Cirkus',
			locations: locationStore,	
			//slug: slug
		}
		
		if(slug === '') {
			return {
				props
			}
		}

		if(locationStore.isExpired(slug)) {
			const url = `/api/locations/${slug}.json`;
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

		// Should we fetch the image here? 
		//await fetch(location.mainImage)

		props.location = location
		props.title = props.location.n
		return { props };
	}
</script>   

<script lang="ts">

    export let title = "Ny Cirkus"
	export let location
	export let locations

	import { onMount } from 'svelte';
	import Map from '$lib/Map/Map.svelte'

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


