
<script context="module" lang="ts">
</script>

<script lang="ts">

    import { onMount } from 'svelte';
    import Icon from 'svelte-awesome/components/Icon.svelte'
    import { phoneSquare, envelopeSquare, facebookSquare, instagram, externalLinkSquare } from 'svelte-awesome/icons';

    let d;
    onMount(async () => {
        // const res = await fetch(`https://jsonplaceholder.typicode.com/photos?_limit=20`);
        // photos = await res.json();

        /*const url = `/api/locations/${slug}.json`;
        const res = await fetch(url);
        if(res.ok) {
            d = await res.json()
        }*/

        // fetch images here
    });

    export let location
    //export let topOffset

</script>

    
<div class="popover {location.type} {location.expand ? 'expand' : ''}" >
 
    {#if location.expand }

<div class="detail-wrapper" >

    <div class="top-info">
        <address>
            {#if location.address}{location.address}{/if }
        </address>
            
        <ul class="links">
                {#if location.web}
                    <li><a rel="external" title="website" alt="Website of {location.n}" href="{location.web}" target="new"><Icon data={externalLinkSquare}/></a></li>
                {/if}
    
                {#if location.ig}
                <li><a rel="external" title="instagram" alt="{location.n} on instagram" href="https://instagram.com/{location.ig}"><Icon data={instagram}/></a></li>
                {/if}
    
                {#if location.fb}
                <li><a rel="external" title="facebook" alt="{location.n} on facebook" href="https://facebook.com/{location.fb}"><Icon data={facebookSquare}/></a></li>
                {/if}
                
            </ul>
        </div>
            
            <h1>{location.n}</h1>
    
            {#if location.about}
            <p>{location.about}</p>
            {/if}
            
            <div class="bottom-info">
    
            <ul>
             {#if location.mail}
             <li>
                <span class="icon"><Icon data={envelopeSquare}/></span> <a href="mailto:{location.mail}">{location.mail}</a>
            </li>
                {/if}
                
                {#if location.phone}
                <li>
                <span class="icon"><Icon data={phoneSquare}/></span> {location.phone}
                </li>
                {/if}
    
            </ul>
    
            </div>
    </div>

    {/if}
</div>


<style lang="scss">

    @import 'src/lib/style/variables.scss';
    .popover {
        position: absolute;
        left: 0;
        right: 0;
        margin-top: -1px;
        //opacity: 0;
        //max-height: 0;
        display: block;
        overflow: hidden;
        color: white;
        border-top:solid $background-color 2px;
        pointer-events: all;

        transform: scaleY(0);    
        transform-origin: top;
        transition: transform 0.2s cubic-bezier(0.645, 0.045, 0.355, 1.000);

        &.expand {
            transform: scaleY(1); 
        }

        @each $class, $color in $locColorMap {
            &.#{$class} {
                background-color: rgba(darken($color, 0.2), 0.8);
            }
        }
	}

    h1, h2, h3, h4, h5, h6, p, a, span {
      pointer-events: auto;
    }

    .detail-wrapper::before {
        content: "";
        position: absolute;
        z-index: -1;
        top: -5%; left: -5%;
        width: 110%; height: 110%;
        background-image: url('/amocbilleder-057-scaled-test-image.jpeg');
        filter: blur(1px) brightness(30%);
        pointer-events: all;
        background-size: cover;
        background-position: center;
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
	

