
<script lang="ts">

    import Icon from 'svelte-awesome/components/Icon.svelte'
    import { phoneSquare, envelopeSquare, facebookSquare, instagram, externalLinkSquare } from 'svelte-awesome/icons';



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
<div class="detail-wrapper">

<div class="top-info">
    <address>
        {#if d.address}{d.address}{/if }
    </address>
        
    <ul class="links">
            {#if d.website}
                <li><a rel="external" title="website" alt="Website of {d.name}" href="{d.website}" target="new"><Icon data={externalLinkSquare}/></a></li>
            {/if}

            {#if d.instagram}
            <li><a rel="external" title="instagram" alt="{d.name} on instagram" href="https://instagram.com/{d.instagram}"><Icon data={instagram}/></a></li>
            {/if}

            {#if d.facebook}
            <li><a rel="external" title="facebook" alt="{d.name} on facebook" href="https://facebook.com/{d.facebook}"><Icon data={facebookSquare}/></a></li>
            {/if}
            

        </ul>
    </div>

		<h1>{d.name}</h1>

		{#if d.about}
		<p>{d.about}</p>
		{/if}
		
        <div class="bottom-info">

        <ul>
         {#if d.email}
         <li>
            <span class="icon"><Icon data={envelopeSquare}/></span> <a href="mailto:{d.email}">{d.email}</a>
        </li>
            {/if}
  
            
            {#if d.phone}
            <li>
            <span class="icon"><Icon data={phoneSquare}/></span> {d.phone}
            </li>
            {/if}

        </ul>


        </div>
</div>
{/if}

<style lang="scss">


    h1, h2, h3, h4, h5, h6, p, a, span {
      pointer-events: auto;
    }
    .detail-wrapper::before {
        content: "";
        position: absolute;
        z-index: -1;
        top: -5%; left: -5%;
        width: 110%; height: 110%;
        background-image: url('static/amocbilleder-057-scaled-test-image.jpeg');
        filter: blur(1px) brightness(30%);
        pointer-events: all;
        background-size: cover;
        opacity: 0.8;
    }

    .detail-wrapper {
        position: relative;
        padding: 2px 2em;
    }

    address {
    }
    h1 {
        font-size: 1.5em;
        margin-top: 0.1em;
    }
    .top-info {
        font-size: 0.9em;
        margin-top: 0.8em;
        display: flex;
        justify-content: space-between;
    }
    .links {
        display: inline-flex;
        padding: 0;
        margin: 0;
        li {
            list-style: none;
            padding: 0 0.2em;
        }
    }
    .bottom-info {
        font-size: 1em;
        margin: 0.8em 0;
        ul {
            display: flex;
            margin: 0;
            padding: 0;
            li {
                list-style: none;
                padding: 0 1.5em 0 0;
                .icon {
                    padding-right: 0.1em;
                    vertical-align: middle;
                }
            }

        }

    }
</style>
	

