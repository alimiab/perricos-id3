// Hamburger menu toggle and dropdown logic
const hamburgerBtn = document.getElementById('hamburgerBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

function closeDropdown() {
	hamburgerBtn.classList.remove('open');
	hamburgerBtn.setAttribute('aria-expanded', 'false');
	dropdownMenu.style.display = 'none';
}

function openDropdown() {
	hamburgerBtn.classList.add('open');
	hamburgerBtn.setAttribute('aria-expanded', 'true');
	dropdownMenu.style.display = 'flex';
}

hamburgerBtn.addEventListener('click', function (e) {
	e.stopPropagation();
	if (dropdownMenu.style.display === 'flex') {
		closeDropdown();
	} else {
		openDropdown();
	}
});

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
	if (dropdownMenu.style.display === 'flex' && !dropdownMenu.contains(e.target) && e.target !== hamburgerBtn) {
		closeDropdown();
	}
});

// Close dropdown when a link is clicked
dropdownMenu.querySelectorAll('a').forEach(link => {
	link.addEventListener('click', closeDropdown);
});
// JavaScript for Landing Page
