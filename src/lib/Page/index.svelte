<script context="module" lang="ts">
	import { browser, dev } from '$app/env';

	// we don't need any JS on this page, though we'll load
	// it in dev so that we get hot module replacement...
	export const hydrate = dev;

	// ...but if the client-side router is already loaded
	// (i.e. we came here from elsewhere in the app), use it
	export const router = browser;

	// since there's no dynamic data here, we can prerender
	// it so that it gets served as a static asset in prod
	export const prerender = true;

</script>

<script lang="ts">
    export let title;
</script>


<svelte:head>
	<title>{title}</title>
</svelte:head>

<section id="page">

<div class="content">
    <slot name="content">
    </slot>
</div>

</section>

<style>
	section#page {
		position: absolute;
		top: 0;
        width: 100%;
		height: 100vh;
		background: #FCFCFC;
        overflow-y: scroll;
	}
    
    .content {
        padding: 2em;
	}
</style>
