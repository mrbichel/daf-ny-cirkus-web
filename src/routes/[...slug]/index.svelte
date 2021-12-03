<script context="module" lang="ts">

	import { locationStore } from '$lib/Map/stores'
	import _ from 'lodash'

    export const prerender = false;
	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ page, fetch, session, stuff }) {

		console.log("load is run")

		async function fetchAll() { // TODO: cache
			const res = await fetch('/api/locations.json')

			if(!res.ok) {
				throw "Error fetching locations"
			}

			return await res.json()	
		}
			
			// TODO: only fetch all on actual refresh
			//if(locationStore < 1) {
				const locations = await fetchAll()
        		locationStore.update(locations)
			//}


		if(page.params.slug === '') {
			return {
				props: {
					title: "Ny Cirkus",
				}
			}
		}
		
		const url = `/api/locations/${page.params.slug}.json`;
		const res = await fetch(url);

		if (res.ok) {		
			const loc = await res.json()
			locationStore.updateLocation(loc)

			return {
				props: {
					slug: `${page.params.slug}`,
					title: loc.n
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script>   

<script lang="ts">
    export let title

	import { onMount } from 'svelte';

	let Map;
	onMount(async () => {
		const module = await import('$lib/Map/index.svelte');
		Map = module.default;

		console.log("onMount for route is run")

		//console.log($locationStore)

	});

</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<svelte:component this='{Map}'>
</svelte:component>

<style lang="scss">		
</style>
	
