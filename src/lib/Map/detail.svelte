
<script lang="ts">
    import { onMount } from 'svelte';

    //let photos = [];
    let randomNumber = 0;

    onMount(async () => {
        // const res = await fetch(`https://jsonplaceholder.typicode.com/photos?_limit=20`);
        // photos = await res.json();

        // TODO: load images and more details
        randomNumber = Math.random()

    });

    export let d
	//export let slug: string
	/*export let name : string
	export let about : string
	export let address : string
	export let email : string
	export let phone : string
	export let website : string
	export let instagram : string
	export let facebook : string*/

</script>

<!--<svelte:head>
	<title>{d.name}</title>
</svelte:head>-->

<!--<h1>Detail view {randomNumber}</h1>-->

{#if d}
		<h1>{d.name}</h1>

		{#if d.about}
		<p>{d.about}</p>
		{/if}
		
		{#if d.address}
		<p>{d.address}</p>
		{/if}
		
		{#if d.email}
			<a href="mailto:{d.email}">{d.email}</a>
		{/if}
		
		{#if d.phone}
			<p>{d.phone}</p>
		{/if}
		
		<ul>
		{#if d.website}
			<li><a href="{d.website}">{d.website}</a></li>
		{/if}
		
		{#if d.facebook}
		<li><a href="{d.facebook}">facebook</a></li>
		{/if}
		
		{#if d.instagram}
		<li><a href="{d.instagram}">instagram</a></li>
		{/if}
		</ul>
{/if}

<style lang="scss">
</style>
	

