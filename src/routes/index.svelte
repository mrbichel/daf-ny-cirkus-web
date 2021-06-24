<script context="module" lang="ts">
	export const prerender = false;
</script>

<script lang="ts">
	//import Map from '$lib/Map/index.svelte';
	import { onMount } from 'svelte';

	let Map;
	onMount(async () => {
		const module = await import('$lib/Mapd3/index.svelte');
		Map = module.default;
	});

</script>

<svelte:head>
	<title>Ny-Cirkus</title>
</svelte:head>

<section id="map">
	<svelte:component this={Map}/>
</section>

<style>

section#map {
	width: 100%;
	height: 100%;
}

</style>
