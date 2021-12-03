<script context="module" lang="ts">

  import dkgeo from './map.geo.json' //'./dk.geo.json'; //'./rollercoaster.geo.json';
  const land = dkgeo;

  let isLoaded = false;
  
</script>

<script lang="ts">

  import { page } from '$app/stores';
  import { locationStore } from '$lib/Map/stores'

  import { goto, invalidate, prefetch, prefetchRoutes } from '$app/navigation';
	import { onMount } from "svelte";

  import * as d3 from 'd3'
  import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom'
  import { interpolateNumber, interpolateZoom } from 'd3-interpolate'
	import { geoMercator, geoPath } from "d3-geo";

  import { describeArc } from './utils'
  
  import lodash_pkg from 'lodash';
  const { _ } = lodash_pkg;

  const markerRadius = 8


	$: projection = geoMercator()
  $: expanded = _.find($locationStore, {expand: true})
  $: path = geoPath().projection(projection)

	let width: number, height: number, initialWidth: number, initialHeight: number;
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
      //.transition().duration(80)
      .attr("transform", () => `scale(${1/transform.k})`)

      // TODO: update popover position if active
      if(expanded) {
        d3.select(".popover.expand").style("top", ll2pT(transform, expanded)[1] + "px" )
      }
  })

  let mapFeatures

  function ll2pT(t: zoomTransform, d: location) {
    return projection(d.loc.coordinates).map((p, i: number) => (i === 0 ? t.x : t.y ) + (t.k * p))
  }

  function renderPath() {
    const pad = width*0.01;
	  projection.fitExtent([[pad, pad], [width-pad*2, height-pad*2]], dkgeo)
    mapFeatures.attr("d", path)
  }

	function renderMap() {

	  renderPath();
    // TODO: se pos if location active

    if(expanded) {

      d3.select(".popover.expand")
      //.style("left", (d) => ll2p(d)[0] + "px" )
      .style("top", `${projection(expanded.loc.coordinates)[1]} px` )

    }

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

	onMount(async function() {
    console.log("onMount isloaded:", isLoaded) 

    initialWidth = width
	  initialHeight = height

    container = d3.select("#map")
    svg = container.select("svg")

    svg.attr("viewBox", [0, 0, width, height])
    .call(zoomHandler)

    g = svg.select(".zoom-container")

    mapFeatures = g.select(".map-layer")
		.selectAll("path")
		.data(land.features)
		.enter()
		.append("path")

    renderMap();
    
    const delaunay = d3.Delaunay.from($locationStore.map( (d) => { return projection(d.loc.coordinates)} ))
    const voronoi = delaunay.voronoi([0, 0, width, height])
    const cells = $locationStore.map((d, i) => {
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
    

    //g.append("path")
    //  .attr("d", delaunay.renderPoints(null, 2));

    isLoaded = true;

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

  function getDistance(a : [number, number], b : [number, number]) {
      const A = a[0] - b[0]
      const B = a[1] - b[1]
    return Math.sqrt(A * A + B * B)
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

  <section id="map" bind:clientWidth={width} bind:clientHeight={height}>

    {#each $locationStore as d}
      <div class="popover {d.type} {d.expand ? 'expand' : ''}"
       on:wheel={ (e) => passWheelEvent(e, svg) }>
        {$page.params.slug}
        <!--<MapDetail slug={$page.params.slug}/>-->
      </div>
	  {/each}

	  <svg on:click={outsideClick}> 
		<g class="zoom-container">
			<rect style="fill: none; pointer-events: all;"></rect>
			<g class="map-layer">
      </g>    
			<g class="marker-layer">
			{#each $locationStore as d}
        <g class="marker {d.type} {d.expand ? 'expand' : ''}" id="marker-{d._id}" 
        transform="{`translate(${projection(d.loc.coordinates)})`}"
              on:mouseover={ () => { if(!d.expand) {prefetch(`/${d.slug}`) }} }
              on:focus={ () => { if(!d.expand) {prefetch(`/${d.slug}`) }} }>

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
	
	#map {
		width: 100%;
		height: 100%;
		overflow: hidden;
		background-color: #FCFCFC;
	}

  .map-layer {
    fill: #26547C;
  }

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
    border-top:solid #FCFCFC 2px;
    pointer-events: all;

    transform: scaleY(0);    
    transform-origin: top;
    transition: transform 0.2s cubic-bezier(0.645, 0.045, 0.355, 1.000);

    &.expand {
      transform: scaleY(1); 
    }
    &.company {
      //border-color: #EF476F;
      background-color: rgba(#EF476F, 0.8);
    }
    &.school {
      //border-color: #06D6A0;
      background-color: rgba(#06D6A0, 0.8);
    }
    &.festival {
      //border-color: #FFD166;
      background-color: rgba(#FFD166, 0.8);
    }

    &.association {
      background-color: rgba(#FFD166, 0.8);
    }

    &.support {
    }
    &.residency-stage {
    }

	}
	.marker {

    &:focus {
        outline: none;
        .circle {
        }
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
    &.company .circle {
      fill: #EF476F;
      stroke: lighten(#EF476F, 20);
    }
    &.school .circle {
      fill: #06D6A0;
      stroke: lighten(#06D6A0, 20);

    }
    &.festival .circle {
      fill: #FFD166;
      stroke: lighten(#FFD166, 20);
    }
    &.expand .circle {
      //fill: #26547C;
      stroke: #FCFCFC;
      fill-opacity: 0.9;
      stroke-opacity: 1;
    }

	}

  </style>