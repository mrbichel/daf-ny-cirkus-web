<script lang="ts">
	import Header from '$lib/Header/index.svelte';
	import '../app.css';
</script>

<!--<Header />-->

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
