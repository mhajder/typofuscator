<script lang="ts">
	import '../app.css';
	import { theme } from '$lib/theme';
	import { onMount } from 'svelte';

	onMount(() => {
		theme.init();
	});
</script>

<slot />
