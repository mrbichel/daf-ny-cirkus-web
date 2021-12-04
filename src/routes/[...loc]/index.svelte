<script context="module" lang="ts">

	import { locationStore } from '$lib/Map/stores'
	import _ from 'lodash'

    //export const prerender = false;
	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ page, fetch, session, stuff }) {

		console.log("load for route is run")

		let data
		const unsubscribe = locationStore.subscribe(d => {
			data = d;
		});

		console.log(data)

		async function fetchAll() { // TODO: cache
			const res = await fetch('/api/locations.json')

			if(!res.ok) {
				throw "Error fetching locations"
			}

			return await res.json()	
		}
			
			// TODO: only fetch all on actual refresh
		if(data.length < 1) {
			const locations = await fetchAll()
        	locationStore.update(locations)
		}

		const props = { title: "Ny Cirkus", locations: locationStore }
		
		if(page.params.loc === '') {
			unsubscribe()
			return {
				props
			}
		}

		/*if(!page.params.loc.match(/^[\w-]+$/)) {
			return {}
		}*/
		
		const url = `/api/locations/${page.params.loc}.json`;
		const res = await fetch(url);

		if (res.ok) {		
			const loc = await res.json()
			locationStore.updateLocation(loc)

			props.title = loc.n
			return {
				props
			};
		}

		unsubscribe()
		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script>   

<script lang="ts">
    export let title
	export let locations

	import { onMount } from 'svelte';
	import Map from '$lib/Map/index.svelte'

	//let Map;
	onMount(async () => {
		/*const module = await import('$lib/Map/index.svelte');
		Map = module.default;
*/
		console.log("onMount for route is run")
		//console.log($locationStore)
	});

</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<Map locations={$locations} >

<!--<div slot="detail">
	<h1>hello</h1>
</div>-->

</Map>

<style lang="scss">		
</style>
	
