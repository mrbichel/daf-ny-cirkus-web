<script lang="ts">
	import { page } from '$app/stores';
	//import logo from './daf-logo.svg';
</script>

<header>

	<nav>
		<ul>
			<li class:active={$page.path === '/'}><a sveltekit:prefetch href="/">Kort</a></li>
			<li class:active={$page.path === '/about'}><a sveltekit:prefetch href="/about">Om ny-cirkus</a></li>
			<li class:active={$page.path === '/artists'}><a sveltekit:prefetch href="/articles">Artikler</a></li>
			<li>DAF logo</li>

		</ul>
	</nav>

</header>

<style lang="scss">
	nav {
		position: absolute;
		top: 0;
		z-index: 1;
		ul {
			display: inline-flex;
		}
	}

</style>
