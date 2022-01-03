
<script context="module" lang="ts">

    // TODO: export staticmarker for legend
    /*export function getStaticMarker() {
        return "<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='-8 -8 16 16' preserveAspectRatio='xMidYMid meet'><circle cx='0' cy='0' r='8'/></svg>"
    }*/

</script>

<script lang="ts">
    import { describeArc } from './utils'
    import { onMount, getContext, createEventDispatcher } from 'svelte';

    import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

    import { goto, prefetch } from '$app/navigation';

    export let projection 
    export let transform 
    export let radius = 8
    export let selected = false

    //export let coordinates = [0,0]

    export let x = 0
    export let y = 0

    export let title = ""
    export let slug = ""
    export let category = ""

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
            await goto('/map', {replaceState: true, keepfocus: true})
        } else {
            dispatch('select', {});
            await goto(`/map/${slug}`, {replaceState: true, keepfocus: true})
        }
    }

</script>

<g class:selected="{selected}" class="marker {category}" 
transform="translate({x*1/transform.k}, {y*1/transform.k}) "
      on:mouseover={ () => { if(!selected) {prefetch(`/map/${slug}`) }} }
      on:focus={ () => { return } }>

  <path class="circle"
      on:click|stopPropagation={ clickHandler  }
      d="{describeArc(0,0,radius, -90, $angleEndTween)}"
      stroke-width={radius*0.6}
      transform={`scale(${1/transform.k})`}
  >
  <title>{title}</title>
</path>

</g>

<style lang="scss">
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
	

