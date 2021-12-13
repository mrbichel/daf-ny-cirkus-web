const c = [
	() => import("../../../src/routes/__layout.svelte"),
	() => import("../components/error.svelte"),
	() => import("../../../src/routes/articles.svelte"),
	() => import("../../../src/routes/contact.svelte"),
	() => import("../../../src/routes/about.svelte"),
	() => import("../../../src/routes/[...loc]/index.svelte")
];

const d = decodeURIComponent;

export const routes = [
	// src/routes/articles.svelte
	[/^\/articles\/?$/, [c[0], c[2]], [c[1]]],

	// src/routes/contact.svelte
	[/^\/contact\/?$/, [c[0], c[3]], [c[1]]],

	// src/routes/about.svelte
	[/^\/about\/?$/, [c[0], c[4]], [c[1]]],

	,

	,

	// src/routes/[...loc]/index.svelte
	[/^(?:\/(.*))?\/?$/, [c[0], c[5]], [c[1]], (m) => ({ loc: d(m[1] || '')})]
];

// we import the root layout/error components eagerly, so that
// connectivity errors after initialisation don't nuke the app
export const fallback = [c[0](), c[1]()];