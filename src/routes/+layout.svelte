<script lang="ts">
	import '../app.css';
	import { theme } from '#lib/theme';
	import { onMount, type Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
	let newWorkerWaiting = $state<ServiceWorker | null>(null);
	let showUpdateToast = $state(false);

	function reloadApp() {
		if (newWorkerWaiting) {
			newWorkerWaiting.postMessage({ type: 'SKIP_WAITING' });
		}
	}

	function dismissToast() {
		showUpdateToast = false;
	}

	onMount(() => {
		theme.init();

		if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/service-worker.js')
				.then((registration) => {
					// If a worker is already waiting, prompt immediately
					if (registration.waiting) {
						newWorkerWaiting = registration.waiting;
						showUpdateToast = true;
					}

					// If a new worker is found
					registration.addEventListener('updatefound', () => {
						const installingWorker = registration.installing;
						if (installingWorker) {
							installingWorker.addEventListener('statechange', () => {
								if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
									newWorkerWaiting = installingWorker;
									showUpdateToast = true;
								}
							});
						}
					});
				})
				.catch(() => {
					// Ignore registration errors (e.g. in test or non-secure contexts)
				});

			let refreshing = false;
			navigator.serviceWorker.addEventListener('controllerchange', () => {
				if (!refreshing) {
					refreshing = true;
					window.location.reload();
				}
			});
		}
	});
</script>

{@render children()}

{#if showUpdateToast}
	<aside
		aria-label="App update notification"
		class="fixed bottom-5 right-5 z-50 max-w-sm p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow-2xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3"
	>
		<div class="text-sm">
			<p class="font-bold flex items-center gap-1.5">
				<span>⚡</span> New version available!
			</p>
			<p class="text-xs text-gray-500 dark:text-gray-400">Update now to get the latest features.</p>
		</div>
		<div class="flex items-center gap-2">
			<button
				onclick={reloadApp}
				class="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
			>
				Reload
			</button>
			<button
				onclick={dismissToast}
				aria-label="Dismiss update notification"
				class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold p-1 leading-none"
			>
				✕
			</button>
		</div>
	</aside>
{/if}
