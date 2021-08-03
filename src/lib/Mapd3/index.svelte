<script>
	import * as d3 from 'd3'
	import { geoMercator, geoPath } from "d3-geo";
	import { onMount } from "svelte";
	import {locations as location_data } from "../locations";
  import lodash_pkg from 'lodash';
  const { _ } = lodash_pkg;  

  // color palette 1: https://coolors.co/ef476f-06d6a0-ffd166-fcfcfc-26547c

  //import { geoVoronoi } from "d3-geo-voronoi"
  //import {delaunay} from "d3-delaunay"
	import dkgeo from './map.geo.json' //'./dk.geo.json'; //'./rollercoaster.geo.json';

	let data = [];
	let width, height, initialWidth, initialHeight;
	let g;
	let svg, container;

  const markerRadius = 8

  // TODO: reverse address lookup
  const locations = location_data.map( (d, i) => {
    d.active = false
    d.id = i

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

  const mapWidth = 2880;
  const mapHeight = 1800;
  
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

      popovers
			//.style("left", (d) => ll2pT(transform, d)[0] + "px" )
			.style("top",  (d) => ll2pT(e.transform, d)[1] + "px" )
  }

	const land = dkgeo;
	const projection = geoMercator()
	const path = geoPath().projection(projection)

  let mapFeatures, popovers, markers

  function ll2pT(t, d) {
    return ll2p(d).map((p, i) => (i === 0 ? t.x : t.y ) + (t.k * p))
  }

  function ll2p(d) {
    return projection([d.lon, d.lat])
  }

  function renderPath() {
    const pad = width*0.01;
	  projection.fitExtent([[pad, pad], [width-pad*2, height-pad*2]], dkgeo)
    mapFeatures.attr("d", path)
  }

	function renderMap() {

	  renderPath();
	  popovers
		//.style("left", (d) => ll2p(d)[0] + "px" )
		.style("top",  (d) => ll2p(d)[1] + "px" )

		markers
      .attr("transform", (d) => "translate(" + ll2p(d)[0] + "," + ll2p(d)[1] + ")")
			//.attr( "x", (d) => ll2p(d)[0]  )
			//.attr( "y", (d) => ll2p(d)[1]  )
	}

	onMount(async function() {

    initialWidth = width;
		initialHeight = height;

		container = d3.select("#d3map")
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

    popovers = d3.selectAll(".popover")
		.data(locations)
    .classed("active", (d) => d.active)
    .on("wheel", (e) => {
      console.log("scroll", e)
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
      .classed("active", (d) => d.active)

		markers
      .select (".circle")
			.on("click", clicked)
			.on("mouseover", function(e, d){
        // TODO: rendering order, render last on top of other
			})
			.on("mouseout", function(){
			})
    
    renderMap();

    const delaunay = d3.Delaunay.from(locations.map(d => {return [ ll2p(d)[0], ll2p(d)[1] ]}))
    const voronoi = delaunay.voronoi([0, 0, width, height])
    const cells = locations.map((d, i) => [[ll2p(d)[0], ll2p(d)[1]], voronoi.cellPolygon(i)]);

    //console.log(cells)
    
    /*g.append("path")  
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

    

	});



  function outsideClick(e) {
    const active = _.find(locations, (d) => d.active == true)
    if(active) {
      e.stopPropagation()
      active.active = false;
      
      markers.classed("active", (d) => d.active)
      popovers.classed("active", (d) => d.active)

      d3.select(`#marker-${active.id}`).select(".circle").transition().duration(750)
        .attrTween("d", (d) => {
            const angleEnd= d3.interpolateNumber(90, 270);
            return function(t) { return describeArc(0,0, markerRadius, -90, angleEnd(t)) };
        })
    }
  }



	function clicked(e, d) {
      e.stopPropagation();
      //const [[x0, y0], [x1, y1]] = path.bounds(d);
      const point = projection([d.lon, d.lat]);
      const t0 = d3.zoomTransform(svg.node());
      const outScale = (t0.k < 2) ? t0.k : t0.k *0.8;

      // get pixel distance 
      const pointNeighbour = projection([d.closestNeighbour.location.lon, d.closestNeighbour.location.lat]);
      var a = pointNeighbour[0] - point[0];
      var b = pointNeighbour[1] - point[1];
      var distance = Math.sqrt(a * a + b * b);

      const minScale =  markerRadius*3 / distance; // zoom in so dots are sperated by atleast 1 marker radius
      const scale = (t0.k > minScale) ? t0.k : minScale;

      if(d.active) {
        d.active = false
        svg.transition().duration(750).call(
          zoom.transform,
          d3.zoomIdentity
            .translate(-point[0]*outScale + width/2, -point[1]*outScale + height/2)
            .scale(outScale),
          d3.pointer(e, svg.node())        
        );

        d3.select(`#marker-${d.id}`).select(".circle").transition().duration(750)
        .attrTween("d", (d) => {
            const angleEnd= d3.interpolateNumber(90, 270);
            return function(t) { return describeArc(0,0, markerRadius, -90, angleEnd(t)) };
        })


      } else {
        const active = _.find(locations, (d) => d.active == true)
        if(active) {
          active.active = false;
          d3.select(`#marker-${active.id}`).select(".circle").transition().duration(750)
            .attrTween("d", (d) => {
                const angleEnd= d3.interpolateNumber(90, 270);
                return function(t) { return describeArc(0,0, markerRadius, -90, angleEnd(t)) };
            })
        }
        
        d.active = true
        //console.log(d)

        svg.transition().duration(750).call(
          zoom.transform,
          d3.zoomIdentity
            .translate(-point[0]*scale + width/2, -point[1]*scale + height/2)
            .scale(scale),
          d3.pointer(e, svg.node())
        );

        d3.select(`#marker-${d.id}`).select(".circle").transition().duration(750)
        .attrTween("d", (d) => {
            const angleEnd= d3.interpolateNumber(270, 90);
            return function(t) { return describeArc(0,0, markerRadius, -90, angleEnd(t)) };
        })

      }

      markers.classed("active", (d) => d.active)
      popovers.classed("active", (d) => d.active)
	  
    }
  
  function polarToCartesian(x, y, r, angleDeg) {
      const rad = (angleDeg-90) * Math.PI / 180.0;
        return [
          x + (r * Math.cos(rad)),
          y + (r * Math.sin(rad))
        ];
  }


  function describeArc(x, y, radius, startAngle=0, endAngle=360){

      const start = polarToCartesian(x, y, radius, endAngle - 0.01);
      const end = polarToCartesian(x, y, radius, startAngle);

      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      const arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

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

  <div id="d3map" bind:clientWidth={width} bind:clientHeight={height}>

	{#each locations as d}	
		<div class="popover {d.type}" id="popover-id-{d.id}">
			<h1>{d.name}</h1>

      {#if d.about}
      <p>{d.about}</p>
      {/if}

      {#if d.address}
			<p>{d.address}</p>
      {/if}

      {#if d.email}
			<a href="mailto:{d.email}">{d.email}</a>
      {/if}

      {#if d.phone}
			<p>{d.phone}</p>
      {/if}

      <ul>
      {#if d.website}
			<li><a href="{d.website}">{d.website}</a></li>
      {/if}

      {#if d.facebook}
      <li><a href="{d.facebook}">facebook</a></li>
      {/if}

      {#if d.instagram}
      <li><a href="{d.instagram}">instagram</a></li>
      {/if}
      </ul>


		</div>	
  	{/each}

	  <svg>
		<g class="zoom-container">
			<rect style="fill: none; pointer-events: all;"></rect>
			<g class="map-layer">
      </g>
			<g class="marker-layer">
			{#each locations as d}
        <g class="marker {d.type}" id="marker-{d.id}">

          <path class="circle" id="circle-{d.id}"
              d="{describeArc(0,0,markerRadius)}"
              stroke-width={markerRadius*0.6}
          />


        </g>
		  {/each}
			</g>

		</g>

	  </svg>

  </div>
  
  <style lang="scss">
	#d3map {
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
		padding: 2px 30px;
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

    &.resstage {

    }

    h1 {
      margin-top: 0.5em;
    }
    h1, h2, h3, h4, h5, h6, p, a, span {
      pointer-events: auto;
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