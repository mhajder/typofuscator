import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__DATE__: `'${new Date().toISOString()}'`,
		__RELOAD_SW__: 'true'
	}
});
