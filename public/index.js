"use strict";
const form = document.getElementById("sj-form");
const address = document.getElementById("sj-address");
const searchEngine = document.getElementById("sj-search-engine");
const error = document.getElementById("sj-error");
const errorCode = document.getElementById("sj-error-code");

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

async function initializeConnection() {
	try {
		await registerSW();
		
		let wispUrl = window.getWispUrl ? window.getWispUrl() : 
			(location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
		
		if ((await connection.getTransport()) !== "/libcurl/index.mjs") {
			await connection.setTransport("/libcurl/index.mjs", [
				{ websocket: wispUrl },
			]);
		}
	} catch (err) {
		console.error("Failed to initialize connection:", err);
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initializeConnection);
} else {
	initializeConnection();
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	try {
		await registerSW();
	} catch (err) {
		error.textContent = "Failed to register service worker.";
		errorCode.textContent = err.toString();
		throw err;
	}

	const url = search(address.value, searchEngine.value);

	let wispUrl = window.getWispUrl ? window.getWispUrl() : 
		(location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
	
	if ((await connection.getTransport()) !== "/libcurl/index.mjs") {
		await connection.setTransport("/libcurl/index.mjs", [
			{ websocket: wispUrl },
		]);
	}

	if (window.navigationLoadURL) {
		await window.navigationLoadURL(url);
	}
});