<script lang="ts">
	import { page } from '$app/stores';
	//import logo from './daf-logo.svg';

// TODO: get static pages from sanity

</script>

<header>
	<nav>
		<ul>
			<li class:active={$page.url.pathname.startsWith('/map') || $page.url.pathname == '/'}><a sveltekit:prefetch href="/map">Map</a></li>
			<li class:active={$page.url.pathname === '/pages/about'}><a sveltekit:prefetch href="/pages/about">About</a></li>
			<li class:active={$page.url.pathname === '/pages/articles'}><a sveltekit:prefetch href="/pages/articles">Articles</a></li>
			<li class:active={$page.url.pathname === '/pages/contact'}><a sveltekit:prefetch href="/pages/contact">Contact</a></li>
			<li id="daf-logo"><a rel="external" href="https://artisten.dk">DAF</a></li>
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
				display: flex;
				li {
					padding: 0.2em 0.5em;
					list-style: none;
				}

				#daf-logo {
					margin-left: auto;
				}
			}
		}
	}

</style>
