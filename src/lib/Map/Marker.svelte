
<script context="module" lang="ts">

    // TODO: export staticmarker for legend

</script>

<script lang="ts">
    import { describeArc } from './utils'
    import { onMount, getContext, createEventDispatcher } from 'svelte';
    import { flip } from 'svelte/animate';

    import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';



    /*onMount(async () => {
    });*/

    import { goto, prefetch } from '$app/navigation';

    //const { getProjection } = getContext('map');
    export let projection 
    export let transform 

    export let markerRadius = 8

    export let selected = false
    export let coordinates = [0,0]

    export let slug = ""
    export let type = ""

    
    const angleEndTween = tweened(270, {
		duration: 750,
		easing: cubicOut
	});
    $: {
        angleEndTween.set(selected ? 90 : 270)
    }

	const dispatch = createEventDispatcher();

    async function clickHandler(e) {
        if(selected) {
            dispatch('deselect', {});
            await goto('/')
        } else {
            dispatch('select', {});
            await goto(`/${slug}`)
        }
    }

    let marker, circle;

    /*export function zoomed() {
        d3.select(circle)
          .attr("transform", () => `scale(${1/transform.k})`)
        
	}*/



</script>

<g bind:this={marker} class:selected="{selected}" class="marker {type}" 
transform="{`translate(${projection(coordinates)})`}"
      on:mouseover={ () => { if(!selected) {prefetch(`/${slug}`) }} }
      on:focus={ () => { return } }>

  <path bind:this={circle} class="circle"
      on:click|stopPropagation={ clickHandler  }
      d="{describeArc(0,0,markerRadius, -90, $angleEndTween)}"
      stroke-width={markerRadius*0.6}
      transform={`scale(${1/transform.k})`}
  />

</g>


<style lang="scss">
    @import 'src/lib/style/variables.scss';

    g {
        &:focus {
            outline: none;
        }
        .circle {
            cursor: pointer;
            stroke-opacity: 0.2;
            fill-opacity: 0.6;
            transition-property: fill-opacity, stroke-opacity, fill, stroke;
            transition-duration: 0.6s;
            transition-timing-function: cubic-bezier(0.645, 0.045, 0.355, 1.000);
            &:hover, &:focus  {
                outline: none;
                fill-opacity: 1;
                stroke-opacity: 1;
                transition-duration: 0.2s;
            }
            &:hover {
                cursor: pointer;
            }      
        }

        @each $class, $color in $locColorMap {
            &.#{$class} {
            .circle {
                fill: $color;
                stroke: lighten($color, 20);
            }
        }
        }
            &.selected .circle {
            //fill: #26547C;
            stroke: #FCFCFC;
            fill-opacity: 0.9;
            stroke-opacity: 1;
        }

    }


</style>
	

