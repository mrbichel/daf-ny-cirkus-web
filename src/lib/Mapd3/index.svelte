<script>
	import * as d3 from 'd3'
	import { geoMercator, geoPath, geoProjection } from "d3-geo";
	import { scaleLinear, scaleSqrt } from "d3-scale";
	import { extent } from "d3-array";
	import { onMount } from "svelte";
	import { feature } from "topojson";
	import { tweened } from "svelte/motion";
	import { interpolate } from "d3-interpolate";
	import {locations as location_data } from "../locations";
	import { _ } from "lodash";
  //import { geoVoronoi } from "d3-geo-voronoi"
//  import {delaunay} from "d3-delaunay"

	import dkgeo from './kommuner.geo.json' //'./dk.geo.json'; //'./rollercoaster.geo.json';

	let data = [];
	let width, height, initialWidth, initialHeight;
	let g;
	let svg, container;

  const pinRadius = 8

  // TODO: reverse address lookup
  const locations = location_data.map((d, i) => {
    d.id = i
    d.active = false
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
      .attr("r", () => pinRadius / e.transform.k )
      .style("stroke-width", () => (pinRadius*0.3) / e.transform.k )


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
			.attr( "cx", (d) => ll2p(d)[0]  )
			.attr( "cy", (d) => ll2p(d)[1]  )
	}

	onMount(async function() {

    initialWidth = width;
		initialHeight = height;

		container = d3.select("#d3map")
		svg = container.select("svg")
    //svg.attr("width", width)
    //.attr("height", height)
    svg.attr("viewBox", [0, 0, width, height])

    svg.call(zoom)
		g = svg.select(".zoom-container")

    mapFeatures = g.select(".map-layer")
		.selectAll("path")
		.data(land.features)
		.enter()
		.append("path")
		.attr("fill", "#26547C")
		//.attr("stroke", "none")
		//.attr("stroke-width", 0.1)

    popovers = d3.selectAll(".popover")
		.data(locations)

		markers = g.select(".marker-layer").selectAll(".pin")
			.data(locations)
      .style("stroke-width", pinRadius*0.3)
      .style("stroke-color", (d) => {
        if(d.type == "school") {
          return "#"
        }
      })
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
    
    g.append("path")
      .attr("d", delaunay.renderPoints(null, 2));

    */

	});



	function clicked(e, d) {
      e.stopPropagation();
      //const [[x0, y0], [x1, y1]] = path.bounds(d);
      const point = projection([d.lon, d.lat]);
      const minScale = 40
      const t0 = d3.zoomTransform(svg.node());
      const scale = (t0.k > minScale) ? t0.k : minScale;

      const outScale = (t0.k < 2) ? t0.k : t0.k *0.5;


      popovers.transition().duration(750)
      .style("opacity", 0)
      .on("end", function(_d) {
        d3.select('#popover-id-'+_d.id).style("display", "none")
      });

      if(d.active) {
        d.active = false

        svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity
          .translate(-point[0]*outScale + width/2, -point[1]*outScale + height/2)
          .scale(outScale),
        d3.pointer(e, svg.node())
      );


      } else {
        locations.forEach( (l) => l.active = false)
        d.active = true

        d3.select('#popover-id-'+d.id)
        .style("display", "block") 
        .transition().duration(750)
        .style("opacity", 1)

          svg.transition().duration(750).call(
          zoom.transform,
          d3.zoomIdentity
            .translate(-point[0]*scale + width/2, -point[1]*scale + height/2)
            .scale(scale),
          d3.pointer(e, svg.node())
        );

      }

      markers.classed("active", (m) => m.active)


    
    //svg.call(zoom.transform, t0);
	 // .classed("active", true);
	  //	.style("left", projection([d.lon, d.lat])[0] + "px" )
	  //	.style("top", projection([d.lon, d.lat])[1] + "px" )

	  
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
			<p>{d.address}</p>
			<p><a href="{d.website}">{d.website}</a></p>
		</div>	
  	{/each}

	  <svg>
		<g class="zoom-container">
			<rect style="fill: none; pointer-events: all;"></rect>
			<g class="map-layer">
      </g>
			<g class="marker-layer">
			{#each locations as d}
			<circle
			  class="pin {d.type}"
			  r={pinRadius}
			   />
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
		background-color: "#FCFCFC";
	}
	.popover {
		position: absolute;
    left: 0;
    right: 0;
    margin-top: -1px;
		opacity: 0;
    display: none;
		color: white;
    border-top:solid #FCFCFC 2px;
		padding: 2px 30px;
		background-color: rgba(0, 0, 0, 0.5);
    pointer-events: none;

    &.company {
      //border-color: #EF476F;
      background-color: #EF476F;
    }
    &.school {
      //border-color: #06D6A0;
      background-color: #06D6A0;
    }
    &.festival {
      //border-color: #FFD166;
      background-color: #FFD166;
    }
    h1 {
      margin-top: 0.5em;
    }
    h1, h2, h3, h4, h5, h6, p, a, span {
      pointer-events: auto;
    }
	}
	.pin {
		cursor: pointer;
    stroke: #FCFCFC;
    stroke-opacity: 0.2;
		fill-opacity: 0.6;
    &.company {
      fill: #EF476F;
    }
    &.school {
      fill: #06D6A0
    }
    &.festival {
      fill: #FFD166
    }

    &:hover {
      cursor: pointer;
      //fill: white;
      fill-opacity: 1;
      stroke-opacity: 0.8;
    }
    &.active {
      fill: #FCFCFC;
      fill-opacity: 1;
      stroke-opacity: 1;
    }

	}

  .polygons {
        stroke: #444;
    }


  </style>