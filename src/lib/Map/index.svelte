<script context="module" lang="ts">
  let componentisLoaded = false;
</script>

<script lang="ts">

  let loaded = false;

  import dkgeo from './map.geo.json'
  const land = dkgeo;
  const features = land.features

  import { page } from '$app/stores';
  import { locationStore } from '$lib/stores'

  import { goto, invalidate, prefetch, prefetchRoutes } from '$app/navigation';
	import { onMount, beforeUpdate, afterUpdate, onDestroy, setContext } from "svelte";

  import * as d3 from 'd3'
  import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom'
  import { interpolateNumber, interpolateZoom } from 'd3-interpolate'
	import { geoMercator, geoPath } from "d3-geo";

  import { describeArc, getDistance } from './utils'
  
  import lodash_pkg from 'lodash';
  const { _ } = lodash_pkg;

  import MapDetail from './detail.svelte'

  /*setContext(map, {
		getProjection: () => projection,
	});*/

  const markerRadius = 8

  export let locations = []

  $: projection = geoMercator()
  $: path = geoPath().projection(projection)

  $: expanded = _.find($locationStore, {expand: true}) // FIXME

  const locTypes = {
    company: {
      title: "Companies",
      color: "#EF476F"
    },
    school: {
      title: "Schools", 
      color: "#06D6A0"
    },
    festival: {
      title: "Festivals", 
      color: "#FFD166"
    }
  }

  const getTypeCssVars = (key) => {
    return Object.entries(locTypes[key])
		.map(([key, value]) => `--${key}:${value}`)
		.join(';');
  }
  
	let width: number = 2880, height: number = 1800 
  let initialWidth: number = width, initialHeight: number = height

	let g, svg, container;

  //const mapWidth = 2880;
  //const mapHeight = 1800;
  
	const zoomHandler = zoom()
      .scaleExtent([0.8, 80])
      .on("zoom", ({transform}) => {

    	g.attr("transform", transform);
    	g.attr("stroke-width", 1 / transform.k);

      g.select(".marker-layer").selectAll(".marker")
      .select(".circle")
      .attr("transform", () => `scale(${1/transform.k})`)

      d3.selectAll(".popover-wrapper")
      .style("top", (d) => {
        return `${transform.y + projection(d.loc.coordinates)[1] * transform.k}px`
      })
  })

  function renderPath() {
    const pad = width*0.01;
	  projection.fitExtent([[pad, pad], [width-pad*2, height-pad*2]], dkgeo)
  }

	function renderMap() {
    console.log("render map")
	  renderPath();
	}

  function passWheelEvent(e, element) {
      e.preventDefault();
       const eventClone = new e.constructor(e.type, {
        clientX: e.clientX, 
        clientY: e.clientY,
        wheelDelta: e.wheelDelta,
        wheelDeltaX: e.wheelDeltaX,
        wheelDeltaY: e. wheelDeltaY
      })
      element.node().dispatchEvent(eventClone);
  }

  beforeUpdate(() => {
		//console.log("before update")
	});

	afterUpdate(() => {
		//console.log("after update")
	});

	onMount(async function() {
    console.log("onMount for map is run componentisLoaded:", componentisLoaded) 

    console.log(width, height)

    projection = geoMercator()
    path = geoPath().projection(projection)

    initialWidth = width
	  initialHeight = height

    container = d3.select("#map")
    svg = container.select("svg")

    zoomHandler.extent([[0, 0], [width, height]])
    svg.call(zoomHandler)

    g = svg.select(".zoom-container")

    renderMap()

    d3.selectAll('.marker').data(locations)
    d3.selectAll('.popover-wrapper').data(locations)
    
    /*const delaunay = d3.Delaunay.from(locations.map( (d) => { return projection(d.loc.coordinates)} ))
    const voronoi = delaunay.voronoi([0, 0, width, height])
    const cells = locations.map((d, i) => {
      return [[projection(d.loc.coordinates)], voronoi.cellPolygon(i)]
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
    console.log("Clicked outside")

    d3.select(`.marker.expand`).select(".circle").transition().duration(750)
        .attrTween("d", (d: location) => {
            const angleEnd= interpolateNumber(90, 270);
            return function(t: number) { return describeArc(0,0, markerRadius, -90, angleEnd(t)) };
        })
        .on("end", async () => {
          // TODO: activeLocation = undefined
          //await goto(`/`) 
        });

    if($page.path != '/') {
      locationStore.toggleExpand()
      await goto('/')
    }

    

    /*if(activeLocation) {
      e.stopPropagation()
      
      d3.select(`#marker-${activeLocation._id}`).select(".circle").transition().duration(750)
        .attrTween("d", (d: location) => {
            const angleEnd= interpolateNumber(90, 270);
            return function(t: number) { return describeArc(0,0, markerRadius, -90, angleEnd(t)) };
        })
        .on("end", async () => {
          // TODO: activeLocation = undefined
          await goto(`/`) 
        });
    }*/

  }

  function getProjectedDistance(a : [number, number], b : [number, number]) {
    return getDistance(projection(a), projection(b))
  }

	async function clicked(e, d: location) {

    e.stopPropagation()

    //const [[x0, y0], [x1, y1]] = path.bounds(d);
    const point = projection(d.loc.coordinates)
    const t0 = zoomTransform(svg.node())
    const outScale : number = (t0.k < 2) ? t0.k : t0.k *0.8

    const distance = getProjectedDistance(d.closestNeighbour.loc.coordinates, d.loc.coordinates)
    const minScale = markerRadius*3 / distance // zoom in so dots are seperated by atleast 1 marker radius

    const scale : number = (t0.k > minScale) ? t0.k : minScale

    if(d.expand) {

      await goto(`/`) 

      console.log("location clicked, will close")
      locationStore.toggleExpand()

      const zOutPoint = [-point[0]*outScale + width*0.5, -point[1]*outScale + height*0.5]


      svg.transition().duration(750).call(
          zoomHandler.transform,
          zoomIdentity 
            .translate( zOutPoint[0], zOutPoint[1]  )
            .scale(outScale),
          d3.pointer(e)        
        ).on("end", async () => {
        })

        d3.select(`#marker-${d._id}`).select(".circle").transition().duration(750)
        .attrTween("d", (d: location) => {
            const angleEnd= interpolateNumber(90, 270)
            return function(t: number) { return describeArc(0,0, markerRadius, -90, angleEnd(t)) }
        })

    } else {

      console.log("location clicked, will expand")

          await new Promise(resolve => {
            if(expanded) {
              console.log("close other expanded")

              d3.select(`#marker-${expanded._id}`).select(".circle").transition().duration(500)
                .attrTween("d", (d: location) => {
                    const angleEnd= interpolateNumber(90, 270)
                    return function(t: number) { return describeArc(0,0, markerRadius, -90, angleEnd(t)) }
                }).on("end", async () => {
                  resolve('end');
              })

            } else {
              resolve('end')
            }
          });

        locationStore.toggleExpand(d._id)
        await goto(`/${d.slug}`)

        const zInPoint = [-point[0]*scale + width*0.5, -point[1]*scale + height*0.38]

        svg.transition().duration(750).call(
          zoomHandler.transform,
          zoomIdentity
            .translate(zInPoint[0], zInPoint[1])
            .scale(scale),
          d3.pointer(e)
        );

        d3.select(`#marker-${d._id}`).select(".circle").transition().duration(750)
        .attrTween("d", () => {
            const angleEnd= interpolateNumber(270, 90);
            return function(t: number) { return describeArc(0,0, markerRadius, -90, angleEnd(t)) };
        })

      }	  
    }
  

  var throttledResize = _.throttle(resizeMap, 800, {leading: false, trailing: true});

  function resize(event) {
    //console.dir(event)
	  //svg.attr("viewBox", [0, 0, width, height])
	  //renderPath();
    const wDiff = initialWidth - width;
    const hDiff = initialHeight - height
    //console.dir(wDiff)
    //const t0 = zoomTransform(svg.node());
    //console.log()
	  //popovers
		//.style("left", (d) => ll2pT(t0, d)[0] - (wDiff*0.5) + "px" )
		//.style("top",  (d) => ll2pT(t0, d)[1] - (hDiff*0.5) + "px" )

    //svg.call(zoom.transform, t0);
		/*markers
			.attr( "cx", (d) => ll2p(d)[0]  )
			.attr( "cy", (d) => ll2p(d)[1]  )
    */  

    // TODO: maybe only redraw if changed more than x amount, otherwise save offsets ?

    throttledResize();
  }

	function resizeMap() {

    const t0 = zoomTransform(svg.node());
		renderMap();
    
    /*popovers
		.style("left", (d) => ll2pT(t0,d)[0] + "px" )
		.style("top",  (d) => ll2pT(t0,d)[1] + "px" )
*/

// TODO: preserve center
    svg.call(zoomHandler.transform, t0);
		throttledResize.cancel();
	}

  </script>

  <svelte:window on:resize={resize} />

  <section id="map" class={loaded ? '' : 'loading'} bind:clientWidth={width} bind:clientHeight={height}>

    {#each locations as d}
    <div class="popover-wrapper" on:wheel={ (e) => passWheelEvent(e, svg) } >
        <MapDetail location={d} />
    </div>
    {/each}

    <aside id="legend">
      <ul>
        {#each Object.keys(locTypes) as t}
        <li style="{getTypeCssVars(t)}" class="{t}">{locTypes[t].title}</li>
        {/each}
      </ul>
    </aside>


    <!--viewBox="0 0 {initialWidth} {initialHeight}"-->

	  <svg viewBox="0 0 {width} {height}" on:click={outsideClick}> 
		<g class="zoom-container">
			<rect style="fill: none; pointer-events: all;"></rect>

      <g class="map-layer">
      {#each features as feature}
      <path
        d={path(feature)} />
       {/each}
      </g>    

			<g class="marker-layer">
			{#each locations as d}
        <g class="marker {d.type} {d.expand ? 'expand' : ''}" id="marker-{d._id}" 
        transform="{`translate(${projection(d.loc.coordinates)})`}" style="{getTypeCssVars(d.type)}"
              on:mouseover={ () => { if(!d.expand) {prefetch(`/${d.slug}`) }} }
              on:focus={ () => { return } }>

          <path class="circle"
              on:click={ (e) => clicked(e, d)  }
              d="{describeArc(0,0,markerRadius)}"
              stroke-width={markerRadius*0.6}
          />
        </g>

		  {/each}
			</g>

		</g>
	  </svg>

  </section>

  <style lang="scss">
  
  @use "sass:color";
  @import 'src/lib/style/variables.scss';

  #legend {
    position: absolute;
    right: 1em;
    top: 2em;
    pointer-events: all;

    @each $class, $color in $locColorMap {
      li.#{$class} {
        color: $color;
      }
    }

  }
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

	.marker {

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
    &.expand .circle {
      //fill: #26547C;
      stroke: #FCFCFC;
      fill-opacity: 0.9;
      stroke-opacity: 1;
    }

	}

  </style>