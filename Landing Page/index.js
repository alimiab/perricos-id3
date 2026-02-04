// Sign-in modal logic
const signinIcon = document.getElementById('signinIcon');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');
const signinModal = document.getElementById('signinModal');
const createAccountLink = document.getElementById('createAccountLink');

function openModal() {
	modalOverlay.style.display = 'flex';
	setTimeout(() => {
		signinModal.focus();
	}, 100);
}
function closeModal() {
	modalOverlay.style.display = 'none';
}
signinIcon.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', function(e) {
	if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', function(e) {
	if (modalOverlay.style.display === 'flex' && e.key === 'Escape') closeModal();
});
createAccountLink.addEventListener('click', function(e) {
	// Let the link redirect normally
	closeModal();
});
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
