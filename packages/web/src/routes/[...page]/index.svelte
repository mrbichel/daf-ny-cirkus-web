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


    //export const prerender = false;
	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ page, fetch, session, stuff }) {
		const slug = page.params.page

        if(slug == '') {
            return
        }

		const url = `/api/pages/${slug}`;
		const res = await fetch(url);

			if (res.ok) {		
				const pageData = await res.json()

                console.log(pageData)
                return { props: {
                    title: pageData.title,
                    content: pageData.content
                } };
				
			} else {
				// TODO: render in locations popover
				return {
					status: res.status,
					error: new Error(`Could not load ${url}`)
				}
			}


		
	}


</script>


<script lang="ts">

    import PortableText from '@portabletext/svelte'

    export let title = "Ny Cirkus page from sanity"
    export let content = []

</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<PortableText
  blocks={content}
/>