<script context="module" lang="ts">

    //export const prerender = false;

	import { activeLocation } from '$lib/Map/stores'
    
	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ page, fetch, session, stuff }) {

		const url = `/api/locations/${page.params.slug}.json`;
		const res = await fetch(url);

		if (res.ok) {

			const loc = await res.json();

			activeLocation.set(loc)

			return {
				props: {
					slug: `${page.params.slug}`,
					name: loc.name
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
	//import { onMount } from 'svelte';
    export let name
</script>

<svelte:head>
	<title>{name}</title>
</svelte:head>

<style lang="scss">		
</style>
	

