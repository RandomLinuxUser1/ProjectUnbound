"use strict";

function initLinksBg() {
	const body = document.body;
	const bg = document.createElement('div');
	bg.className = 'links-bg';
	
	const gridOverlay = document.createElement('div');
	gridOverlay.className = 'links-grid-overlay';
	bg.appendChild(gridOverlay);
	
	body.insertBefore(bg, body.firstChild);
	
	const particleCount = 50;
	
	for (let i = 0; i < particleCount; i++) {
		const particle = document.createElement('div');
		particle.className = 'links-particle';
		
		const size = Math.random() * 4 + 1;
		const x = Math.random() * 100;
		const y = Math.random() * 100;
		const duration = Math.random() * 20 + 10;
		const delay = Math.random() * 5;
		const opacity = Math.random() * 0.5 + 0.1;
		
		const colors = ['rgba(100, 150, 255, ', 'rgba(150, 100, 255, ', 'rgba(200, 150, 255, '];
		const color = colors[Math.floor(Math.random() * colors.length)];
		
		particle.style.width = size + 'px';
		particle.style.height = size + 'px';
		particle.style.left = x + '%';
		particle.style.top = y + '%';
		particle.style.background = color + opacity + ')';
		particle.style.animation = `linkFloat ${duration}s ease-in-out ${delay}s infinite`;
		particle.style.boxShadow = `0 0 ${size * 2}px ${color + (opacity * 0.8) + ')'}`;
		
		bg.appendChild(particle);
	}
}

async function loadLinks() {
	try {
		const response = await fetch('links.json');
		const data = await response.json();
		renderLinks(data);
	} catch (error) {
		console.error('Failed to load links:', error);
		document.getElementById('links-content').innerHTML = `
			<div style="text-align: center; color: rgba(255, 255, 255, 0.6); padding: 40px;">
				<p>Failed to load links. Please try again later.</p>
			</div>
		`;
	}
}

function renderLinks(data) {
	const container = document.getElementById('links-content');
	container.innerHTML = '';
	
	data.categories.forEach(category => {
		const section = document.createElement('div');
		section.className = 'category-section';
		
		const header = document.createElement('div');
		header.className = 'category-header';
		
		const icon = document.createElement('span');
		icon.className = 'category-icon';
		icon.textContent = category.icon;
		
		const title = document.createElement('h2');
		title.className = 'category-title';
		title.textContent = category.name;
		
		header.appendChild(icon);
		header.appendChild(title);
		
		const linksGrid = document.createElement('div');
		linksGrid.className = 'category-links';
		
		category.links.forEach(link => {
			const button = document.createElement('button');
			button.className = 'link-button';
			
			const nameSpan = document.createElement('span');
			nameSpan.className = 'link-name';
			nameSpan.textContent = link.name;
			
			const arrow = document.createElement('span');
			arrow.className = 'link-arrow';
			arrow.textContent = '→';
			
			button.appendChild(nameSpan);
			button.appendChild(arrow);
			
			button.addEventListener('click', async () => {
				if (window.navigationLoadURL) {
					const searchEngine = document.getElementById('sj-search-engine').value;
					const url = search(link.url, searchEngine);
					await window.navigationLoadURL(url);
				}
			});
			
			linksGrid.appendChild(button);
		});
		
		section.appendChild(header);
		section.appendChild(linksGrid);
		container.appendChild(section);
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		initLinksBg();
		loadLinks();
	});
} else {
	initLinksBg();
	loadLinks();
}