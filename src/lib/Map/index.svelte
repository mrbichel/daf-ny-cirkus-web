<script lang="ts">
	import * as L from 'leaflet';
	import 'leaflet/dist/leaflet.css';

	import { locations } from "../locations";


	let map;

	function createMap(container) {
		let m = L.map(container).setView([55.849415076631765, 10.77827338793981], 7);
		L.tileLayer(
			'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
			{
				attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>,
				&copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`,
				subdomains: 'abcd',
				maxZoom: 18,
				minZoom: 4,
			}
			).addTo(m);

		
		locations.map(loc => {
			var circle = L.circle([loc.lat, loc.lon], {
				color: 'red',
				fillColor: '#f03',
				fillOpacity: 0.5,
				radius: 500
			}).addTo(m).bindPopup(`<h1>${loc.name}</h1><br />${loc.address}`);;
		})

		return m;
		
	}

	function mapAction(container) {
		map = createMap(container);
		return {
		destroy: () => {
			map.remove();
		},
		};
	}

	function resizeMap() {
		if(map) { map.invalidateSize(); }
	}

</script>

<svelte:window on:resize={resizeMap} />

<div id="map" use:mapAction />

<style>
#map {
	width: 100%;
	height: 100%;
}
</style>
