"use strict";

const SETTINGS_KEY = 'pu_settings';

const defaultSettings = {
	cloakMode: 'none',
	wispUrl: ''
};

function loadSettings() {
	try {
		const saved = localStorage.getItem(SETTINGS_KEY);
		return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
	} catch (e) {
		return defaultSettings;
	}
}

function saveSettings(settings) {
	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
	} catch (e) {
		console.error('Failed to save settings:', e);
	}
}

function getWispUrl() {
	const settings = loadSettings();
	if (settings.wispUrl && settings.wispUrl.trim()) {
		return settings.wispUrl.trim();
	}
	return (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
}

function applyCloaking() {
	const settings = loadSettings();
	
	if (settings.cloakMode === 'about:blank') {
		const currentUrl = window.location.href;
		const win = window.open('about:blank', '_blank');
		if (win) {
			win.document.write(`
				<!DOCTYPE html>
				<html>
				<head>
					<title>about:blank</title>
					<style>
						body, html {
							margin: 0;
							padding: 0;
							width: 100%;
							height: 100%;
							overflow: hidden;
						}
						iframe {
							border: none;
							width: 100%;
							height: 100%;
						}
					</style>
				</head>
				<body>
					<iframe src="${currentUrl}"></iframe>
				</body>
				</html>
			`);
			win.document.close();
			window.close();
		}
	} else if (settings.cloakMode === 'blob') {
		const currentUrl = window.location.href;
		fetch(currentUrl)
			.then(r => r.text())
			.then(html => {
				const blob = new Blob([html], { type: 'text/html' });
				const blobUrl = URL.createObjectURL(blob);
				const win = window.open(blobUrl, '_blank');
				if (win) {
					window.close();
				}
			})
			.catch(err => {
				console.error('Blob cloak failed:', err);
			});
	}
}

function initSettings() {
	const settingsBtn = document.getElementById('settings-btn');
	const settingsBtnMain = document.getElementById('settings-btn-main');
	const settingsOverlay = document.getElementById('settings-overlay');
	const settingsClose = document.getElementById('settings-close');
	const settingsSave = document.getElementById('settings-save');
	
	const cloakSelect = document.getElementById('cloak-mode');
	const wispInput = document.getElementById('wisp-url');
	
	function openSettings() {
		const settings = loadSettings();
		cloakSelect.value = settings.cloakMode;
		wispInput.value = settings.wispUrl;
		wispInput.placeholder = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
		settingsOverlay.classList.add('active');
	}
	
	function closeSettings() {
		settingsOverlay.classList.remove('active');
	}
	
	if (settingsBtn) {
		settingsBtn.addEventListener('click', openSettings);
	}
	
	if (settingsBtnMain) {
		settingsBtnMain.addEventListener('click', openSettings);
	}
	
	settingsClose.addEventListener('click', closeSettings);
	
	settingsOverlay.addEventListener('click', (e) => {
		if (e.target === settingsOverlay) {
			closeSettings();
		}
	});
	
	settingsSave.addEventListener('click', () => {
		const settings = {
			cloakMode: cloakSelect.value,
			wispUrl: wispInput.value.trim()
		};
		saveSettings(settings);
		closeSettings();
		
		if (settings.cloakMode !== 'none') {
			alert('Cloaking will be applied on next page load. Refresh to apply.');
		}
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		initSettings();
		if (!window.location.href.includes('iframe')) {
			applyCloaking();
		}
	});
} else {
	initSettings();
	if (!window.location.href.includes('iframe')) {
		applyCloaking();
	}
}

window.getWispUrl = getWispUrl;