<script context="module" lang="ts">

  interface location {
    readonly type: string;
    readonly name: string;
    lat?: number;
    lon?: number;
    id?: number;
    readonly about?: string;
    readonly address?: string;
    readonly phone?: string;
    readonly email?: string;
    readonly website?: string;
    readonly instagram?: string;
    readonly facebook?: string;
    active?: boolean;
    slug?: string;
    closestNeighbour?: {
      distance: number;
      location: location;
    };
    [propName: string]: any;
  }

  let isLoaded = false;

</script>

<script lang="ts">

  import { page } from '$app/stores';
  //import { activeLocation, locations } from '$lib/Map/stores'

  import { goto, invalidate, prefetch, prefetchRoutes } from '$app/navigation';
	import { onMount } from "svelte";

  import slug from 'slug'
  import * as d3 from 'd3'
	import { geoMercator, geoPath } from "d3-geo";
  
	import {locations as location_data } from "../../locations";

  import lodash_pkg from 'lodash';
  const { _ } = lodash_pkg;

  import dkgeo from './map.geo.json' //'./dk.geo.json'; //'./rollercoaster.geo.json';

  import MapDetail from './detail.svelte';

  const land = dkgeo;
	const projection = geoMercator()
	const path = geoPath().projection(projection)
  const markerRadius = 8


  let activeLocation : location = undefined;

  // color palette 1: https://coolors.co/ef476f-06d6a0-ffd166-fcfcfc-26547c
  //import { geoVoronoi } from "d3-geo-voronoi"
  //import {delaunay} from "d3-delaunay"

	let width: number, height: number, initialWidth: number, initialHeight: number;
	let g, svg, container;


  //const mapWidth = 2880;
  //const mapHeight = 1800;
  
	const zoom = d3.zoom()
      .scaleExtent([0.8, 80])
      .on("zoom", zoomed);
  
	function zoomed(e) {
    	g.attr("transform", e.transform);
    	g.attr("stroke-width", 1 / e.transform.k);

      markers
      .select(".circle")
      //.transition().duration(80)
      .attr("transform", () => `scale(${1/e.transform.k})`)

      // TODO: update popover position if active
      if(activeLocation) {
        popover
			  //.style("left", (d) => ll2pT(transform, d)[0] + "px" )
			  .style("top", ll2pT(e.transform, activeLocation)[1] + "px" )
      }

      
  }

  let mapFeatures, popover, markers

  function ll2pT(t: d3.zoomTransform, d: location) {
    return ll2p(d).map((p, i: number) => (i === 0 ? t.x : t.y ) + (t.k * p))
  }

  function ll2p(d: location) {
    return projection([d.lon, d.lat])
  }

  function renderPath() {
    const pad = width*0.01;
	  projection.fitExtent([[pad, pad], [width-pad*2, height-pad*2]], dkgeo)
    mapFeatures.attr("d", path)
  }

	function renderMap() {

	  renderPath();
    // TODO: se pos if location active

    if(activeLocation) {
	  popover
		//.style("left", (d) => ll2p(d)[0] + "px" )
		.style("top", ll2p(activeLocation)[1] + "px" )
    }

		markers
      .attr("transform", (d: location) => "translate(" + ll2p(d)[0] + "," + ll2p(d)[1] + ")")
			//.attr( "x", (d) => ll2p(d)[0]  )
			//.attr( "y", (d) => ll2p(d)[1]  )
	}

  let locations = location_data.map( (d, i) => {
    
    if(d.lat === undefined) {
      d.lat = 0;   // TODO: reverse address lookup
    }
    if(d.lon === undefined) {
      d.lon = 0; 
    }

    d.active = false
    d.id = i // TODO: change to database id and require in interface 
    
    d.slug = slug(d.name)

    const neighbours = location_data.filter(n => n != d).map( n => {
      return {
        distance: d3.geoDistance([n.lon, n.lat], [d.lon, d.lat]),
        location: n
      }
    })
    //d.closestNeighbours = _.sortBy( neighbours, 'distance');
    d.closestNeighbour = _.sortBy( neighbours, 'distance')[0];
    return d
  })

	onMount(async function() {

    console.log("onMount isloaded:", isLoaded)    
    isLoaded = true;

    initialWidth = width;
		initialHeight = height;

		container = d3.select("#map")
		svg = container.select("svg")
    //svg.attr("width", width)
    //.attr("height", height)
    svg.attr("viewBox", [0, 0, width, height])
    .on('click', outsideClick)

    svg.call(zoom)
		g = svg.select(".zoom-container")

    mapFeatures = g.select(".map-layer")
		.selectAll("path")
		.data(land.features)
		.enter()
		.append("path")

    popover = d3.select(".popover")
    .on("wheel", (e) => {
      //console.log("scroll", e)
      e.preventDefault();
      const eventClone = new e.constructor(e.type, {
        clientX: e.clientX, 
        clientY: e.clientY,
        wheelDelta: e.wheelDelta,
        wheelDeltaX: e.wheelDeltaX,
        wheelDeltaY: e. wheelDeltaY})
      svg.node().dispatchEvent(eventClone);
    })

    markers = g.select(".marker-layer").selectAll(".marker")
			.data(locations)

		markers
      .select (".circle")
			.on("click", clicked)
			.on("mouseover", function(e, d: location){
        // TODO: rendering order, render last on top of other
			})
			.on("mouseout", function(){
			})
    
    renderMap();
    /*
    const delaunay = d3.Delaunay.from(locations.map( ll2p ))
    const voronoi = delaunay.voronoi([0, 0, width, height])
    
    const cells = locations.map((d, i) => {
      return [[ll2p(d)], voronoi.cellPolygon(i)]
    });

    //console.log(cells)
    
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
    
    g.append("path")
      .attr("d", delaunay.renderPoints(null, 2));
    */

	});

  async function outsideClick(e) {
    
    if(activeLocation) {
      e.stopPropagation()
      locations[activeLocation.id].active = activeLocation.active = false;
      
      d3.select(`#marker-${activeLocation.id}`).select(".circle").transition().duration(750)
        .attrTween("d", (d: location) => {
            const angleEnd= d3.interpolateNumber(90, 270);
            return function(t: number) { return describeArc(0,0, markerRadius, -90, angleEnd(t)) };
        })
        .on("end", async () => {
          activeLocation = undefined
          await goto(`/`) 
        });
    }

  }

	async function clicked(e, d: location) {

      e.stopPropagation()
      //const [[x0, y0], [x1, y1]] = path.bounds(d);
      const point = projection([d.lon, d.lat])
      const t0 = d3.zoomTransform(svg.node())
      const outScale : number = (t0.k < 2) ? t0.k : t0.k *0.8

      // get pixel distance 
      const pointNeighbour = projection([d.closestNeighbour.location.lon, d.closestNeighbour.location.lat])
      var a = pointNeighbour[0] - point[0]
      var b = pointNeighbour[1] - point[1]
      var distance = Math.sqrt(a * a + b * b)

      const minScale = markerRadius*3 / distance // zoom in so dots are seperated by atleast 1 marker radius
      const scale : number = (t0.k > minScale) ? t0.k : minScale

      const targetPoint = [-point[0]*scale + width*0.5, -point[1]*scale + height*0.38]

      if(d.active) {
        locations[d.id].active = activeLocation.active = false
        
        svg.transition().duration(750).call(
          zoom.transform,
          d3.zoomIdentity 
            .translate( targetPoint[0], targetPoint[1]  )
            .scale(outScale),
          d3.pointer(e, svg.node())        
        ).on("end", async () => {
          activeLocation = undefined
          await goto(`/`) 
        })

        d3.select(`#marker-${d.id}`).select(".circle").transition().duration(750)
        .attrTween("d", (d: location) => {
            const angleEnd= d3.interpolateNumber(90, 270)
            return function(t: number) { return describeArc(0,0, markerRadius, -90, angleEnd(t)) }
        })

      } else {
        
        /*await new Promise(resolve => {
        });*/

          await new Promise(resolve => {
            console.log(activeLocation)
            if(activeLocation) {
               
              locations[activeLocation.id].active = activeLocation.active = false

              d3.select(`#marker-${activeLocation.id}`).select(".circle").transition().duration(500)
                .attrTween("d", (d: location) => {
                    const angleEnd= d3.interpolateNumber(90, 270)
                    return function(t: number) { return describeArc(0,0, markerRadius, -90, angleEnd(t)) }
                }).on("end", async () => {
                  resolve('end');
              })
            } else {
              resolve('end')
            }

          });
        
        //d.active = true
        locations[d.id].active = true 
        await goto(`/${d.slug}`)  //TODO: make slug
        activeLocation = d

        svg.transition().duration(750).call(
          zoom.transform,
          d3.zoomIdentity
            .translate(targetPoint[0], targetPoint[1])
            .scale(scale),
          d3.pointer(e, svg.node())
        );

        d3.select(`#marker-${d.id}`).select(".circle").transition().duration(750)
        .attrTween("d", (d: location) => {
            const angleEnd= d3.interpolateNumber(270, 90);
            return function(t: number) { return describeArc(0,0, markerRadius, -90, angleEnd(t)) };
        })

      }	  
    }
  
  function polarToCartesian(x: number, y: number, r: number, angleDeg: number) : [x: number, y: number] {
      const rad = (angleDeg-90) * Math.PI / 180.0;
        return [
          x + (r * Math.cos(rad)),
          y + (r * Math.sin(rad))
        ]; 
  } 


  function describeArc(x: number, y: number, radius: number, startAngle: number=0, endAngle: number=360) :
  string {

      const start = polarToCartesian(x, y, radius, endAngle - 0.01);
      const end = polarToCartesian(x, y, radius, startAngle);

      //const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      const arcSweep : '0'|'1' = endAngle - startAngle <= 180 ? '0' : '1';

      return `M ${start[0]} ${start[1]} A ${radius} ${radius} 0 ${arcSweep} 0 ${end[0]} ${end[1]} ${(endAngle - startAngle === 360) ? 'Z' : ''}`;     
  }

  var throttledResize = _.throttle(resizeMap, 800, {leading: false, trailing: true});

  function resize(event) {
    //console.dir(event)
	  //svg.attr("viewBox", [0, 0, width, height])
	  //renderPath();
    const wDiff = initialWidth - width;
    const hDiff = initialHeight - height
    //console.dir(wDiff)

    //const t0 = d3.zoomTransform(svg.node());

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

    const t0 = d3.zoomTransform(svg.node());
		renderMap();
    
    /*popovers
		.style("left", (d) => ll2pT(t0,d)[0] + "px" )
		.style("top",  (d) => ll2pT(t0,d)[1] + "px" )
*/

// TODO: preserve center
    svg.call(zoom.transform, t0);
		throttledResize.cancel();
	}

  </script>

  <svelte:window on:resize={resize} />

  <section id="map" bind:clientWidth={width} bind:clientHeight={height}>
  
    <div class="popover { activeLocation ? `${activeLocation.type} ${activeLocation.active ? 'active' : ''}` : '' }" >
      <!--{$page.params.slug}-->
      <MapDetail d={activeLocation}/>
    </div>

	  <svg>
		<g class="zoom-container">
			<rect style="fill: none; pointer-events: all;"></rect>
			<g class="map-layer">
      </g>
			<g class="marker-layer">
			{#each locations as d}
        <g class="marker {d.type} {d.active ? 'active' : ''}" id="marker-{d.id}">
          <path class="circle" id="circle-{d.id}"
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
    transition: transform 0.5s cubic-bezier(0.645, 0.045, 0.355, 1.000);

    &.active {
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
    .circle {
      cursor: pointer;
      stroke-opacity: 0.2;
      fill-opacity: 0.6;
      transition-property: fill-opacity, stroke-opacity, fill, stroke;
      transition-duration: 0.6s;
      transition-timing-function: cubic-bezier(0.645, 0.045, 0.355, 1.000);

      &:hover  {
        cursor: pointer;
        fill-opacity: 1;
        stroke-opacity: 1;
        transition-duration: 0.2s;
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
    &.active .circle {
      //fill: #26547C;
      stroke: #FCFCFC;
      fill-opacity: 0.9;
      stroke-opacity: 1;
    }

	}

  </style>