// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const searchButton = document.querySelector('button');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const closeModalButton = document.getElementById('closeModal');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

// NASA provides this key for requests to the APOD API.
const apiKey = 'KwBr7mqHPz6BwBGtKtqWzLw9bnqhFmtKMHq9zkFn';

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Fetch and display the APOD entries for the selected date range.
searchButton.addEventListener('click', getSpaceImages);

async function getSpaceImages() {
	if (!startInput.value || !endInput.value) {
		gallery.textContent = 'Please choose a start date and an end date.';
		return;
	}

	if (startInput.value > endInput.value) {
		gallery.textContent = 'The start date must be before the end date.';
		return;
	}

	gallery.textContent = '🔄 Loading space photos…';
	searchButton.disabled = true;

	const query = new URLSearchParams({
		api_key: apiKey,
		start_date: startInput.value,
		end_date: endInput.value
	});

	try {
		const response = await fetch(`https://api.nasa.gov/planetary/apod?${query}`);
		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.error?.message || 'NASA could not load the images.');
		}

		if (result.error) {
			throw new Error(result.error.message);
		}

		const images = Array.isArray(result) ? result : [result];
		if (images.length > 0 && images.every(isNASAPlaceholder)) {
			throw new Error('NASA is currently returning placeholder data instead of APOD photos. Please try again later.');
		}

		displaySpaceImages(result);
	} catch (error) {
		gallery.textContent = error.message;
	} finally {
		searchButton.disabled = false;
	}
}

function isNASAPlaceholder(spaceImage) {
	return spaceImage.title === 'NASA Science' && spaceImage.url.includes('nasa-logo');
}

function displaySpaceImages(spaceImages) {
	gallery.textContent = '';
	const images = Array.isArray(spaceImages) ? spaceImages : [spaceImages];

	images.forEach((spaceImage) => {
		const galleryItem = document.createElement('article');
		galleryItem.className = 'gallery-item';
		galleryItem.addEventListener('click', () => openModal(spaceImage));

		const title = document.createElement('h2');
		title.textContent = spaceImage.title;

		const date = document.createElement('p');
		date.textContent = spaceImage.date;

		const media = document.createElement(spaceImage.media_type === 'video' ? 'iframe' : 'img');
		media.src = spaceImage.url;
		media.alt = spaceImage.title;
		media.title = spaceImage.title;
		if (spaceImage.media_type === 'video') {
			media.allowFullscreen = true;
			media.loading = 'lazy';
		}

		const description = document.createElement('p');
		description.textContent = spaceImage.explanation;

		galleryItem.append(title, date, media, description);
		if (spaceImage.media_type === 'video') {
			galleryItem.appendChild(createVideoLink(spaceImage.url));
		}
		gallery.appendChild(galleryItem);
	});
}

function openModal(spaceImage) {
	modalMedia.textContent = '';
	const media = document.createElement(spaceImage.media_type === 'video' ? 'iframe' : 'img');
	media.src = spaceImage.url;
	media.alt = spaceImage.title;
	media.title = spaceImage.title;
	if (spaceImage.media_type === 'video') {
		media.allowFullscreen = true;
	}
	modalMedia.appendChild(media);
	if (spaceImage.media_type === 'video') {
		modalMedia.appendChild(createVideoLink(spaceImage.url));
	}

	modalTitle.textContent = spaceImage.title;
	modalDate.textContent = spaceImage.date;
	modalExplanation.textContent = spaceImage.explanation;
	modal.hidden = false;
	closeModalButton.focus();
}

function createVideoLink(videoUrl) {
	const videoLink = document.createElement('a');
	videoLink.className = 'video-link';
	videoLink.href = videoUrl;
	videoLink.target = '_blank';
	videoLink.rel = 'noopener noreferrer';
	videoLink.textContent = 'Watch this video on NASA or YouTube';
	return videoLink;
}

function closeModal() {
	modal.hidden = true;
}

closeModalButton.addEventListener('click', closeModal);

// Close the modal when the user clicks the dark area around the content.
modal.addEventListener('click', (event) => {
	if (event.target === modal) {
		closeModal();
	}
});

// Let users close the modal with the Escape key.
document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && !modal.hidden) {
		closeModal();
	}
});
