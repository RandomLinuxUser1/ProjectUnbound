"use strict";
function search(input, template) {
	let cleanInput = input.trim();
	
	cleanInput = cleanInput.replace(/^https?:\/\//, '');
	cleanInput = cleanInput.replace(/^www\./, '');
	
	try {
		return new URL(cleanInput).toString();
	} catch (err) {
	}

	try {
		const url = new URL(`http://${cleanInput}`);
		if (url.hostname.includes(".")) return url.toString();
	} catch (err) {
	}

	return template.replace("%s", encodeURIComponent(input));
}