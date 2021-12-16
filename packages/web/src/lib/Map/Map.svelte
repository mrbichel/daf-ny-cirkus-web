<script context="module" lang="ts">
  let componentisLoaded = false;

  import type { Location } from '../../types'

</script>

<script lang="ts">

  import dkgeo from './map-data/dk.geo.json'
  const land = dkgeo;
  const features = land.features

  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
	import { onMount, beforeUpdate, afterUpdate, onDestroy, setContext } from "svelte";

  import { select } from 'd3-selection'
  import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom'
	import { geoMercator, geoPath } from "d3-geo";
  import { getDistance } from './utils'
  
  import lodash_pkg from 'lodash';
  const { _ } = lodash_pkg;

  import Detail from './Detail.svelte'
  import Marker from './Marker.svelte'
  import Legend from './Legend.svelte'

  const markerRadius = 8
  let loaded = false;

  export let locations : Location[] = []
  export let expanded : Location = undefined

  let projection = geoMercator()
  let T = zoomTransform(1, 0, 0)

  /*$: {
    console.log("recompute projection")
    const pad = mapWidth*0.01;
    projection = geoMercator()
    projection.fitExtent([[pad, pad], [mapWidth-pad*2, mapHeight-pad*2]], dkgeo)
    zoomHandler.extent([[0, 0], [mapWidth, mapHeight]])
  }*/

  $: path = geoPath().projection(projection)

  /*setContext('map', {
		getProjection: () => projection,
	});*/

  const locTypes = {
    company: {
      title: "Companies",
    },
    school: {
      title: "Schools", 
    },
    festival: {
      title: "Festivals", 
    },
    association: {
      title: "Associations", 
    },
    support: {
      title: "Supprt", 
    },
    'residency-stage': {
      title: "Residencies and stages", 
    }

  }

  /*const getTypeCssVars = (key) => {
    return Object.entries(locTypes[key])
		.map(([key, value]) => `--${key}:${value}`)
		.join(';');
  }*/
  
	let width: number = 2880, height: number = 1800 
  let mapWidth: number = width, mapHeight: number = height
	let svg

  const maxScale = 90;

	const zoomHandler = zoom()
      .scaleExtent([0.8, maxScale])
      .on("zoom", ({transform}) => {
        T = transform
  })

  function renderPath() {
	  //projection.fitExtent([[pad, pad], [width-pad*2, height-pad*2]], dkgeo)
  }

  function passWheelEvent(e, element) {
      element.dispatchEvent(
        new e.constructor(e.type, {
        clientX: e.clientX, 
        clientY: e.clientY,
        wheelDelta: e.wheelDelta,
        wheelDeltaX: e.wheelDeltaX,
        wheelDeltaY: e. wheelDeltaY
      }));
  }

  /*beforeUpdate(() => {
	});

	afterUpdate(() => {
	});*/


	onMount(async function() {    
    mapWidth = width
	  mapHeight = height

    select(svg).call(zoomHandler) 

    const pad = mapWidth*0.01;
    projection = geoMercator()
    projection.fitExtent([[pad, pad], [mapWidth-pad*2, mapHeight-pad*2]], dkgeo)
    zoomHandler.extent([[0, 0], [mapWidth, mapHeight]])

    T = zoomTransform(select(svg).node())

    if(expanded) {
      expandLocation(expanded)
    }

    // TODO: calculate if any markers are overlapping and make draw them offset or as cluster ... 

    /*
    const delaunay = d3.Delaunay.from(locations.map( (d) => { return projection([d.location.lng, d.location.lat])} ))
    const voronoi = delaunay.voronoi([0, 0, width, height])
    const cells = locations.map((d, i) => {
      return [[projection([d.location.lng, d.location.lat])], voronoi.cellPolygon(i)]
    });
    g.append("path")  
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("d", voronoi.render());
    g.append("g")
      .attr("stroke", "orange")
    .selectAll("path")
    .data(cells)
    .join("path")
      .attr("d", ([d, cell]) => `M${d3.polygonCentroid(cell)}L${d}`);
    */
    //g.append("path")
    //  .attr("d", delaunay.renderPoints(null, 2));

    componentisLoaded = true
    loaded = true

	});

  async function outsideClick(e) {
    e.stopPropagation()
    if($page.path != '/') {
      await goto('/map', {replaceState: true, keepfocus: true})
    }
  }

  function getProjectedDistance(a : [number, number], b : [number, number]) {
    return getDistance(projection(a), projection(b))
  }

  async function expandLocation(d: Location) {

    const point = projection([d.location.lng, d.location.lat])
    const distance = getProjectedDistance([d.closestNeighbour.location.lng, d.closestNeighbour.location.lat], [d.location.lng, d.location.lat])

    if(distance < markerRadius) {
      // too close to seperate by zoom
      console.log("too close to seperate by zoom")
    }
    
    const max = Math.min(markerRadius*3 / Math.max(distance, 0.001), maxScale) // zoom in so dots are seperated by atleast 1 marker radius or to maxZoom
    const scale : number = (T.k > max) ? T.k : max

    const zInPoint = [-point[0]*scale + width*0.5, -point[1]*scale + height*0.38]
        zoomTo(zInPoint, scale, 750)

  }


  async function closeLocation(d: Location) {

    const point = projection([d.location.lng, d.location.lat])
    const outScale : number = (T.k < 2) ? T.k : T.k *0.8

    const zOutPoint = [-point[0]*outScale + width*0.5, -point[1]*outScale + height*0.5]
      zoomTo(zOutPoint, outScale, 750)

}

  function zoomTo( point, scale, duration=750) {

    return select(svg).transition().duration(duration).call(
          zoomHandler.transform,
          zoomIdentity 
            .translate( point[0], point[1]  )
            .scale(scale)     
        )

  }

  var throttledResize = _.throttle(resizeMap, 800, {leading: false, trailing: true});

  function resize(event) {
    throttledResize(event);
  }

	function resizeMap(event) {
    console.log("resize")
    const t = zoomTransform(svg)

    // Just reset on resize
    //select(svg).call(zoomHandler.transform, zoomIdentity);
    //projection = geoMercator()
    //zoomHandler.extent([[0, 0], [width, height]])

    const wDiff = mapWidth - width
    const hDiff = mapHeight - height

    mapWidth = width
    mapHeight = height

    const pad = mapWidth*0.01;
    projection = geoMercator()
    projection.fitExtent([[pad, pad], [mapWidth-pad*2, mapHeight-pad*2]], dkgeo)
    zoomHandler.extent([[0, 0], [mapWidth, mapHeight]])

    select(svg).call(zoomHandler.transform, zoomIdentity)

    //select(svg).call(zoomHandler.transform, zoomIdentity.scale(t.k));
    //zoomHandler.scale(t.k)
    //zoomHandler.translateTo(select(svg), /*-t.x*t.k +*/ width*0.5 + (t.x), /*-t.y*t.k +*/ height*0.5 + (t.y))
    //zoomHandler.translateTo(select(svg).translate)
    //zoomHandler.scaleTo(select(svg), t.k)
    // FIXME: preserve center
    //select(svg).call(zoomHandler.transform, t);
    // const zInPoint = [-point[0]*scale + width*0.5, -point[1]*scale + height*0.38]
    console.log(t)
    //const point = [-t.x + width*0.5 + (wDiff*t.k *0.5), -t.y + width*0.5 + (hDiff*t.k *0.5)]

    /*zoomIdentity.translateBy(x, y).scale(k);

    select(svg).call(
          zoomHandler.transform,
          zoomIdentity 
            .translate( wDiff, hDiff  )
            .scale(t.k)     
        )
*/
    //   .translate( t.x + (wDiff*t.k *0.5), t.y + (hDiff*t.k *0.5)  ) very close 
    //const point = [-mapWidth*0.5*t0.k + mapWidth*0.5, -mapHeight*0.5*t0.k + mapHeight*0.5]

    /*const point = [t.x *t.k, t.y *t.k]
    console.log(point)
        zoomTo( point, t.k, 750)*/

		throttledResize.cancel();
	}

  </script>

  <svelte:window on:resize={resize} />

  <section id="map" class={loaded ? '' : 'loading'} bind:clientWidth={width} bind:clientHeight={height}>

    {#each locations as d}
    <div class="popover-wrapper" on:wheel|preventDefault={ (e) => passWheelEvent(e, svg) } 
      style={`top: ${T.y + projection([d.location.lng, d.location.lat])[1] * T.k }px` }  >
        <Detail data={d} />
    </div>
    {/each}

    <Legend data={locTypes} />

    <!--viewBox="0 0 {initialWidth} {initialHeight}"-->

	  <svg viewBox="0 0 {width} {height}" on:click={outsideClick} bind:this={svg}> 
		<g class="zoom-container" transform={T} stroke-width={1/T.k} >
			<rect style="fill: none; pointer-events: all;"></rect>

      <g class="map-layer">
      {#each features as feature}
      <path
        d={path(feature)} />
       {/each}
      </g>    

			<g class="marker-layer">
			{#each locations as d}
        <Marker category={d.category} 
          selected={d.expand} 
          coordinates={[d.location.lng, d.location.lat]} 
          slug={d.slug} 
          projection={projection}
          transform={T} 
          radius={markerRadius}
          title={d.title}
          on:select={ () => expandLocation(d) }
          on:deselect={ () => closeLocation(d) }
          />
		  {/each}
			</g>

		</g>
	  </svg>

  </section>

  <style lang="scss">
  
  .popover-wrapper {
    pointer-events: all;
    position: absolute;
    left: 0;
    right: 0;
  }
  svg {  
    width: 100%;
    height: 100%;
  }
	#map {
		width: 100%;
		height: 100%;
		overflow: hidden;
		background-color: $background-color;

    opacity: 1;
    transition-property: opacity;
    transition-duration: 0.6s;
    &.loading {
      opacity: 0;
    }
	}

  .map-layer {
    fill: $map-primary-color;
  }

  </style>