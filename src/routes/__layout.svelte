<script lang="ts">
	import Navigation from '$lib/Navigation/index.svelte';
	import '../app.css';

	import { onMount } from 'svelte';

	let Map;

	onMount(async () => {
		const module = await import('$lib/Map/index.svelte');
		Map = module.default;

	});

</script>

<Navigation />

<main>
	<svelte:component this={Map}>
	</svelte:component>

	<slot>
	</slot>

</main>

<footer>
	<p>ny-cirkus.dk</p>
</footer>

<style lang="scss">
main {
    height: 100vh;
    //display: flex;
}

footer {
		position: absolute;
		bottom: 0;
		z-index: 1;
	}

</style>
