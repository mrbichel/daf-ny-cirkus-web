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
	
	<slot/>

</main>

<footer>
	<ul>
		<li>email</li>
		<li>copyright 2021 Dansk Artist Forbund</li>
		<li><a rel="external" href="https://artisten.dk">artisten.dk</a></li>

	</ul>
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
		background: rgba(255,255,255,0.8);
		width: 100%;
		display: flex;
		justify-content: flex-end;

		font-size: 0.6em;

		border-top: 1px solid grey ;


		ul {
				margin: 0.1em 0;
				padding: 0;
				display: inline-flex;
			li {
				list-style: none;
				padding: 0.5em;
			}
		}
	}

</style>
