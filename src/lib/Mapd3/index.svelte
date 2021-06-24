<script>
	import * as d3 from 'd3'
	import { geoMercator, geoPath, geoProjection } from "d3-geo";
	import { scaleLinear, scaleSqrt } from "d3-scale";
	import { extent } from "d3-array";
	import { onMount } from "svelte";
	import { feature } from "topojson";
	import { tweened } from "svelte/motion";
	import { interpolate } from "d3-interpolate";
	import { locations } from "../locations";
	import { _ } from "lodash"

	import dkgeo from './dk.geo.json';

	let data = [];
	let initialWidth, width, initialHeight, height;
	let g;
	let svg, container;

	const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", zoomed);
  
	function zoomed(event) {
    	const {transform} = event;
      //console.log(event)
    	g.attr("transform", transform);
    	g.attr("stroke-width", 1 / transform.k);

		d3.selectAll(".tooltip")
			.data(locations)
			.style("left", function (d) { return transform.x + (transform.k * projection([d.lon, d.lat])[0]) + "px" })
			.style("top",  function (d) { return transform.y + (transform.k * projection([d.lon, d.lat])[1]) + "px" })

  	}

	const land = dkgeo;
	const projection = geoMercator()

	//$: aspect = width / height;

	function renderMap() {

		container = d3.select("#d3map")
		svg = container.select("svg")
		.attr("viewBox", [0, 0, width, height])

	  //.attr("preserveAspectRatio", "xMinYMid")
		
	  projection
      //.rotate([0, 0.0])
      //.fitExtent([[0, 0], [width, height]], dkgeo.features)
      //.center([10.77827338793981, 55.849415076631765])
      //.scale(10000)
      //.translate([width/2, height/2])
      .fitExtent([[0, 0], [width, height]], dkgeo)

	  d3.selectAll(".tooltip")
			.data(locations)
			.style("left", function (d) { return projection([d.lon, d.lat])[0] + "px" })
			.style("top",  function (d) { return projection([d.lon, d.lat])[1] + "px" })

	  const path = geoPath().projection(projection)

	  svg.call(zoom)
	  g = svg.select("g")

	  g.append("rect")
	  .style("fill", "none")
 	  .style("pointer-events", "all");

	  g.select(".map-layer")
		.selectAll("path")
		.data(land.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("fill", "grey")
		.attr("stroke", "#FFF")
		.attr("stroke-width", 0.5)
		//.on("mouseover", mouseOverHandler)
		//.on("mouseout", mouseOutHandler)
		//.on("click", clickHandler);

    g.select(".marker-layer").selectAll(".pin")
		.data(locations)
    	.on("click", clicked)
    	.on("mouseover", function(e, d){
                //d3.selectAll("text").remove(); 

              /*label.append("svg:text")
                .attr("x", projection([d.lon, d.lat])[0])
                .attr("y", projection([d.lon, d.lat])[1])
                .attr("class", "halo")
                .text(d.name);
              label.append("svg:text")
                .attr("x", projection([d.lon, d.lat])[0])
                .attr("y", projection([d.lon, d.lat])[1])
                .attr("class", "text")
                .text(d.name);*/
              })
    .on("mouseout", function(){
    })
	/*.attr("transform", function(d) {
			return "translate(" + projection([
			d.lon,
			d.lat
			]) + ")";
	});*/

		/*
		{#each locations as location}
		  <circle
			class="location"
			cx={projection([location.lon, location.lat])[0]}
			cy={projection([location.lon, location.lat])[1]}
			r=4
			fill='white'
			 />
		{/each}
		*/
	}

	onMount(async function() {
		initialWidth = width;
		initialHeight = height;
		renderMap();
	});

	function clicked(event, d) {
      //const [[x0, y0], [x1, y1]] = path.bounds(d);

      const point = projection([d.lon, d.lat]);
      const scale = 2
      //zoom.scale(0.9);
      //zoom.translate([-point[0] * 0.9, -point[1] * 0.9]);
      //console.log(d)
      event.stopPropagation();
      
      d3.selectAll('.pin').transition().style("fill", null);
      d3.select(this).transition().style("fill", "red");

      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(scale)
          .translate((-point[0] * scale) / 2, (-point[1] * scale) / 2),
        d3.pointer(event, svg.node())
      );

	  d3.selectAll('.tooltip').transition().duration(750)
	  .style("opacity", 0)
	  .on("end", function(e) {
		d3.selectAll('#tooltip-id-'+e.id).style("display", "none")
	  });
	  
	  d3.select('#tooltip-id-'+d.id)
	  .style("display", "block") 
	  .transition().duration(750)
	  .style("opacity", 1)
	  
	 // .classed("active", true);

	  //	.style("left", projection([d.lon, d.lat])[0] + "px" )
	  //	.style("top", projection([d.lon, d.lat])[1] + "px" )

	  
    }

	function resizeMap() {

		// consider simply scaling map in a way preserving current interaction 

		d3.select("#d3map").select("svg").remove()
		renderMap();

		//svg.attr("viewBox", [0, 0, width, height])
	  	//.attr("preserveAspectRatio", "xMinYMid")
		
		//projection
		//.rotate([0, 0.0])
		//.fitExtent([[0, 0], [width, height]], dkgeo.features)
		//.center([10.77827338793981, 55.849415076631765])
		//.scale(10000)
		//.translate([width/2, height/2])
		//.fitExtent([[0, 0], [width, height]], dkgeo)

		console.log("resize")
		throttledResize.cancel();

	//svg.attr("width", width)
    //    .attr("height", height)
		//svg.attr("viewBox", [0, 0, width, height])
	
	  //projection
      //.rotate([0, 0.0])
      //.fitExtent([[0, 0], [width, height]], dkgeo.features)
      //.scale(10000)
      //.translate([width/2, height/2])
	  //.center([10.77827338793981, 55.849415076631765])

      //.fitExtent([[0, 0], [width, height]], dkgeo)
	}

	var throttledResize = _.throttle(resizeMap, 800, {leading: false, trailing: true});

  </script>

  <svelte:window on:resize={throttledResize} />

  <div id="d3map" bind:clientWidth={width} bind:clientHeight={height}>

	{#each locations as d}	
		<div class="tooltip" id="tooltip-id-{d.id}" data-lat="{d.lat}" data-lon="{d.lon}"
		style="left: {projection([d.lon, d.lat])[0]} px; top: {projection([d.lon, d.lat])[1]} px">
			<h1>{d.name}</h1>
			<p>{d.address}</p>
			<p>{d.website}</p>

		</div>	
  	{/each}

	  <svg>
		<g class="zoom-container">

			<g class="map-layer"></g>

			<g class="marker-layer">
			{#each locations as location}
			<circle
			  class="pin"
			  cx={projection([location.lon, location.lat])[0]}
			  cy={projection([location.lon, location.lat])[1]}
			  r=4
			  fill='white'
			   />
		  	{/each}
			</g>

		</g>

	  </svg>

  </div>
  
  <style>
	#d3map {
		width: 100%;
		height: 100%;
		overflow: hidden;
		background-color: black;
	}
	.tooltip {
		position: absolute; 
		opacity: 0;
		color: white;
		padding: 10px;
		background-color: black;

	}

	.pin {
		cursor: pointer;
		fill: white;
	}


  </style>