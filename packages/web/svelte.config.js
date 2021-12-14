import preprocess from 'svelte-preprocess';
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import vercel from '@sveltejs/adapter-vercel'

const filePath = dirname(fileURLToPath(import.meta.url))
const srcPath = `${filePath}/src/`

export default {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		/*scss: {
			prependData: `@import '${srcPath}/app.scss';`
		}*/
		scss: {
			prependData: `@import 'src/styles/variables.scss';`
		},
	}),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		adapter: vercel()
	}
};



