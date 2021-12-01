<script lang="ts">
	import { page } from '$app/stores';
	//import logo from './daf-logo.svg';
</script>

<header>

	<nav>
		<ul>
			<li class:active={$page.path === '/'}><a sveltekit:prefetch href="/">Map</a></li>
			<li class:active={$page.path === '/about'}><a sveltekit:prefetch href="/about">About</a></li>
			<li class:active={$page.path === '/articles'}><a sveltekit:prefetch href="/articles">Articles</a></li>
			<li class:active={$page.path === '/contact'}><a sveltekit:prefetch href="/contact">Contact</a></li>
			<li>DAF logo</li>

		</ul>
	</nav>

</header>

<style lang="scss">
	header {
		background: rgba(255,255,255,0.8);
		position: absolute;
		top: 0;
		z-index: 1;
		width: 100%;
		border-bottom: 1px solid grey ;
		nav {
			ul {
				margin: 0.1em 0;
				padding: 0;
				display: inline-flex;
				li {
					padding: 0.2em 0.5em;
					list-style: none;
				}
			}
		}
	}

</style>
