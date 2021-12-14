<script lang="ts">
	import Navigation from '$lib/Navigation/index.svelte';
</script>

<Navigation />

<main>
	<slot></slot>
</main>

<footer>
	<ul>
		<li>info@ny-cirkus.dk</li>
		<li>copyright 2021 Dansk Artist Forbund</li>
		<li><a rel="external" href="https://artisten.dk">artisten.dk</a></li>
	</ul>
</footer>

<style lang="scss">
	:global {
		@import 'src/styles/global.scss';
	}
	
	main {
		height: 100vh;
		//display: flex;
	}
	footer {
		position: absolute;
		bottom: 0;
		z-index: 1;
		background: rgba($background-color,0.8);
		width: 100%;
		display: flex;
		justify-content: flex-end;

		font-size: 0.6em;
		border-top: 1px solid grey ;

		ul {
			margin: 0.1em 0;
			padding: 0;
			display: inline-flex;
			li {
				list-style: none;
				padding: 0.5em;
			}
		}
	}

</style>
