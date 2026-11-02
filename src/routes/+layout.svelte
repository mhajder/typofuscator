<script lang="ts">
	import '../app.css';
	import { theme } from '#lib/theme';
	import { onMount, type Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	onMount(() => {
		theme.init();
	});
</script>

{@render children()}
