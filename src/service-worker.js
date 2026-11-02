/* global self, caches, fetch, Response, URL */
/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { resolve } from '$app/paths';

const CACHE = `cache-${version}`;

const ASSETS = Array.from(
	new Set([
		...immutable.map((asset) => resolve(asset.path)),
		...assets.map((asset) => resolve(asset.path)),
		...prerendered.map((page) => resolve(page.path))
	])
);

sw.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) {
				await caches.delete(key);
			}
		}
	}

	event.waitUntil(deleteOldCaches());
});

sw.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		sw.skipWaiting();
	}
});

sw.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// Serve cached assets if available
		if (ASSETS.includes(url.pathname)) {
			const cachedResponse = await cache.match(url.pathname);
			if (cachedResponse) {
				return cachedResponse;
			}
		}

		// Try network first, falling back to cache
		try {
			const response = await fetch(event.request);

			if (response.status === 200 && url.origin === sw.location.origin) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch {
			const cachedResponse = await cache.match(event.request);
			if (cachedResponse) {
				return cachedResponse;
			}

			// For navigation requests, fallback to root if available
			if (event.request.mode === 'navigate') {
				const fallback = await cache.match(resolve('/'));
				if (fallback) return fallback;
			}

			return new Response('Offline', { status: 503, statusText: 'Offline' });
		}
	}

	event.respondWith(respond());
});
