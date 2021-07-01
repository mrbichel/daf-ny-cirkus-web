<script lang="ts">
	import Navigation from '$lib/Navigation/index.svelte';
	import '../app.css';
</script>

<Navigation />

<main>
	<slot />
</main>

<!--<footer>
	<p>ny-cirkus.dk</p>
</footer>-->

<style>

main {
    height: 100vh;
    display: flex;
}

</style>
