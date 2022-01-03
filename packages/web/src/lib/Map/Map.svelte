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
	import { onMount, beforeUpdate, afterUpdate, onDestroy, setContext } from 'svelte';

  import { select } from 'd3-selection'
  import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom'
	import { geoMercator, geoPath } from 'd3-geo';
  import { pack, hierarchy, packSiblings, packEnclose } from 'd3-hierarchy';

  import { mean } from 'd3-array';


  import { getDistance } from './utils'
  
  import lodash_pkg from 'lodash';
  const { _ } = lodash_pkg;

  import Detail from './Detail.svelte'
  import Marker from './Marker.svelte'
  import Legend from './Legend.svelte'

  const markerRadius = 10
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
      title: "Support", 
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

        computeClusters()
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
  let clusters = []

  function computeClusters() {

    let clusterCount = 0;
    const clusteredIds = []
    const clusterData = locations.map(d0 => {

      //d0.inCluster = false
      const p0 = [d0.location.lng, d0.location.lat]
      const neighbours = _.sortBy(locations.filter(d1 => d1._id != d0._id).map(d1 => {
        const p1 = [d1.location.lng, d1.location.lat]
        d1._distance = getProjectedDistance(p0, p1) * maxScale
        d1._point = projection(p1)

        return d1
      }).filter(d => d._distance < markerRadius*2), 'distance')

      d0._neighbours = neighbours
      d0._point = projection(p0)

      return d0

    }).filter(d => (d._neighbours.length > 0) == true)
    .map((d, idx) => {
      if(clusteredIds.includes(d._id)) {
        return false
      } else {
        clusteredIds.push(d._id)
        
        const children = d._neighbours.filter(n => {
          return !clusteredIds.includes(n._id)
        }).map(n => {
          clusteredIds.push(n._id)
          return n
        })
        children.push(d)

        const center = [ mean(children.map(c => c._point[0])), mean(children.map(c => c._point[1]))]

        const packChildren = packSiblings(children.map(c => {
          c.r = markerRadius*1.2
          return c
        }))

        const enclosing = packEnclose(packChildren)

        return {
          name: `cluster ${clusterCount++}`,
          children: packChildren,
          x: center[0],
          y: center[1],
          enclosing: enclosing
        }
      }
    }).filter(Boolean)

    // TODO: recursive packing, packed circles will overlap woth others or hide non packed circles - recursively pack untill all circles are "free"

    // Consider only packing at max zoom level and have it constant!!

    clusters = clusterData
    console.log(clusters)
    //const packs = clusterData.map(packFunction)
      
    //console.log(packs)

    /*packs.map(p => {
      const node = select(svg).select('.marker-layer').append("g")
    .selectAll("circle")
    .data(p.descendants().slice(1))
    .join("circle")
      .attr("fill", "white")
      .attr("r", d => d.r)
      .attr("pointer-events", d => !d.children ? "none" : null)
      .on("mouseover", function() { select(this).attr("stroke", "#000"); })
      .on("mouseout", function() { select(this).attr("stroke", null); })
      .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));
    })*/

    //clusters = clusterData


  }

	onMount(async function() {    
    mapWidth = width
	  mapHeight = height

    select(svg).call(zoomHandler) 

    const pad = mapWidth*0.01;
    projection = geoMercator()
    projection.fitExtent([[pad, pad], [mapWidth-pad*2, mapHeight-pad*2]], dkgeo)
    zoomHandler.extent([[0, 0], [mapWidth, mapHeight]])

    T = zoomTransform(select(svg).node())

    computeClusters()

    if(expanded) {
      expandLocation(expanded)
    }

    // TODO: calculate if any markers are overlapping and make draw them offset or as cluster ... 


    
    /*markersToCluster.map(d => {
      // calculate neighbour clusters for filtered list
      const neighbours = markersToCluster.filter(n => n._id != d._id).map( n => {
                    const distance = geoDistance([n.location.lng, n.location.lat], [d.location.lng, d.location.lat])
                    return {
                        distance: distance,
                        location: n.location,
                        _id: n._id
                    }
                })
                //console.log(neighbours)
        
                //d.closestNeighbours = _.sortBy( neighbours, 'distance');
                d.closestNeighbour = _.sortBy( neighbours, 'distance')[0];

    })*/


    //console.log(markersToCluster)

    /*locations.map(d => {
      const point = projection([d.location.lng, d.location.lat])
      //console.log(d.closestNeighbour)
      const distance = getProjectedDistance([d.closestNeighbour.location.lng, d.closestNeighbour.location.lat], [d.location.lng, d.location.lat])

      if(distance < markerRadius) {
        // too close to seperate by zoom
        console.warn("too close to seperate by zoom")

        if(clusteredIds.includes[d._id]) {
          console.log("already in cluster")
        } else {
          clusteredIds.push(d._id)
          const cluster = {name: `cluster for ${d.title}`, children: [] }
          // make cluster call recursively
          locations.map(n => {


          })

          clusters.children.push(cluster)
        }
      }

    })*/


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
    //console.log(d.closestNeighbour)
    const distance = getProjectedDistance([d.closestNeighbour.location.lng, d.closestNeighbour.location.lat], [d.location.lng, d.location.lat])

    if(distance < markerRadius) {
      // too close to seperate by zoom
      console.warn("too close to seperate by zoom")
    }

    //console.log('distance', distance)
    const max = Math.min(markerRadius*3 / Math.max(distance, 0.001), maxScale) // zoom in so dots are seperated by atleast 1 marker radius or to maxZoom
    //console.log('max', max)
    const scale : number = (T.k > max) ? T.k : max
    //console.log('scale', scale)

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
    //console.log("resize")
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
    //console.log(t)
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
          <path d={path(feature)} />
        {/each}
      </g>


      <g class="marker-layer">

      {#each clusters as cluster}

      <g class="cluster" transform="translate({cluster.x},{cluster.y})">

      <circle cx="0" cy="0" r="{cluster.enclosing.r}" transform={`scale(${1/T.k})`}/>

        {#each cluster.children as d}

        <Marker category={d.category} 
        selected={d.expand}
        x={d.x}
        y={d.y}
        slug={d.slug} 
        projection={projection}
        transform={T} 
        radius={ markerRadius }
        title={d.title}r
        on:select={ () => expandLocation(d) }
        on:deselect={ () => closeLocation(d) }
        />

          <!--<circle cx="{d.x}" cy="{d.y}" r="{d.r}" transform={`scale(${1/T.k})`}/>-->
        {/each}
      </g>

      {/each}

			<!--{#each locations as d}

        <Marker category={d.category} 
          selected={d.expand} 
          coordinates={[d.location.lng, d.location.lat]} 
          slug={d.slug} 
          projection={projection}
          transform={T} 
          radius={ markerRadius }
          title={d.title}r
          on:select={ () => expandLocation(d) }
          on:deselect={ () => closeLocation(d) }
          />
		  {/each}-->
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