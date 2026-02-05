const floatingTopbar = document.getElementById('floating-topbar');
const loadingOverlay = document.getElementById('loading-overlay');
const homeBtn = document.getElementById('home-btn');
const refreshBtn = document.getElementById('refresh-btn');
const topbarAddress = document.getElementById('topbar-address');
const topbarForm = document.getElementById('topbar-form');
const topbarToggle = document.getElementById('topbar-toggle');

let currentFrame = null;
let isBrowsing = false;
let currentURL = '';
let isTopbarHidden = false;

function showLoading() {
	loadingOverlay.classList.add('active');
}

function hideLoading() {
	loadingOverlay.classList.remove('active');
}

function enterBrowsingMode() {
	isBrowsing = true;
	document.body.classList.add('browsing-mode');
	floatingTopbar.classList.add('active');
	topbarToggle.classList.add('active');
}

function exitBrowsingMode() {
	isBrowsing = false;
	document.body.classList.remove('browsing-mode');
	floatingTopbar.classList.remove('active');
	topbarToggle.classList.remove('active');
	if (currentFrame) {
		currentFrame.remove();
		currentFrame = null;
	}
	currentURL = '';
	isTopbarHidden = false;
	floatingTopbar.classList.remove('hidden');
	topbarToggle.classList.remove('hidden');
}

async function loadURL(url) {
	showLoading();
	
	if (!isBrowsing) {
		enterBrowsingMode();
	}
	
	if (currentFrame) {
		currentFrame.remove();
	}
	
	topbarAddress.value = url;
	currentURL = url;
	
	const { ScramjetController } = $scramjetLoadController();
	const scramjet = new ScramjetController({
		files: {
			wasm: "/scram/scramjet.wasm.wasm",
			all: "/scram/scramjet.all.js",
			sync: "/scram/scramjet.sync.js",
		},
	});
	
	await scramjet.init();
	
	const frame = scramjet.createFrame();
	frame.frame.id = "sj-frame";
	currentFrame = frame.frame;
	document.body.appendChild(frame.frame);
	
	let hasLoaded = false;
	let hasError = false;
	
	const loadHandler = () => {
		if (!hasLoaded) {
			hasLoaded = true;
			hideLoading();
		}
	};
	
	const errorHandler = () => {
		if (!hasError) {
			hasError = true;
			hideLoading();
			window.location.href = '/404.html';
		}
	};
	
	frame.frame.addEventListener('load', () => {
		try {
			const frameDoc = frame.frame.contentDocument || frame.frame.contentWindow.document;
			const pageText = frameDoc.body ? frameDoc.body.innerText.toLowerCase() : '';
			
			if (pageText.includes('might be temporarily down') || 
			    pageText.includes('moved permanently') ||
			    pageText.includes('webpage') && pageText.includes('might be')) {
				errorHandler();
				return;
			}
		} catch (e) {
		}
		loadHandler();
	});
	
	frame.frame.addEventListener('error', errorHandler);
	
	const timeout = setTimeout(() => {
		if (!hasLoaded && !hasError) {
			hasLoaded = true;
			hideLoading();
		}
	}, 10000);
	
	try {
		frame.go(url);
	} catch (e) {
		errorHandler();
	}
	
	frame.frame.addEventListener('load', () => {
		clearTimeout(timeout);
	}, { once: true });
}

homeBtn.addEventListener('click', () => {
	exitBrowsingMode();
	const mainAddress = document.getElementById('sj-address');
	mainAddress.value = '';
	topbarAddress.value = '';
	window.location.href = '/';
});

const gamesBtnMain = document.getElementById('games-btn-main');
if (gamesBtnMain) {
	gamesBtnMain.addEventListener('click', () => {
		window.location.href = '/links.html';
	});
}

refreshBtn.addEventListener('click', async () => {
	if (currentURL && isBrowsing) {
		await loadURL(currentURL);
	}
});

topbarToggle.addEventListener('click', () => {
	isTopbarHidden = !isTopbarHidden;
	if (isTopbarHidden) {
		floatingTopbar.classList.add('hidden');
		topbarToggle.classList.add('hidden');
	} else {
		floatingTopbar.classList.remove('hidden');
		topbarToggle.classList.remove('hidden');
	}
});

topbarForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	const query = topbarAddress.value.trim();
	if (query) {
		const searchEngine = document.getElementById('sj-search-engine').value;
		const url = search(query, searchEngine);
		await loadURL(url);
	}
});

window.navigationLoadURL = loadURL;