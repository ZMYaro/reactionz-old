var data;
var main;

function init() {
	Object.defineProperty(window, 'title', {
		get: function () {
			return document.title;
		},
		set: function (value) {
			document.title = value;
			document.getElementById('title').innerText =
				document.getElementById('title').textContent = value;
		},
		enumerable: true
	});
	
	main = document.getElementById('main');
	
	navigate();
}

/**
 * Naviate to a particular section based on the hash in the URL
 */
function navigate() {
	var loc = location.hash.substring(1).split('/');
	
	if (location.hash.length <= 1) {
		// If there is nothing in the hash, load the list of categories.
		loadCategories();
	} else if (loc.length === 1) {
		// If there is only one thing, assume it is a category.
		loadCategory(loc[0]);
	} else {
		// If there is a second thing, assume it is an item within a category.
		loadItem(loc[0], loc[1]);
	}
}


/**
 * Load the list of categories
 */
function loadCategories() {
	if (location.hash !== '' && location.hash !== '#') {
		location.hash = '';
	}
	if (!data) {
		loadData(loadCategories);
		return;
	}
	
	title = 'Reactions';
	document.getElementById('title').disabled = true;
	document.getElementById('title').classList.remove('holo-up');
	document.getElementById('title').removeEventListener('click', loadCategories, false);
	
	main.innerHTML = new EJS({url: 'templates/categories.ejs'}).render({data: data});
}

/**
 * Load the items in a particular category
 * @param {String|MouseEvent} category - The category from which to load items
 */
function loadCategory(category) {
	if (location.hash !== '#' + category) {
		location.hash = category;
	}
	if (!data) {
		loadData(navigate);
		return;
	}
	
	title = data[category].name;
	document.getElementById('title').disabled = false;
	document.getElementById('title').classList.add('holo-up');
	document.getElementById('title').addEventListener('click', loadCategories, false);
	
	var templateData = data[category];
	templateData.category = category;
	main.innerHTML = new EJS({url: 'templates/category.ejs'}).render(templateData);
}

/**
 * Load an item within a category
 * @param {String} category - The category from which to load the item
 * @param {String} index - The index of the item within the category
 */
function loadItem(category, index) {
	if (location.hash !== '#' + category + '/' + index) {
		location.hash = category + '/' + index;
	}
	if (!data) {
		loadData(navigate);
		return;
	}
	
	title = data[category].items[index].name;
	document.getElementById('title').disabled = false;
	document.getElementById('title').classList.add('holo-up');
	document.getElementById('title').addEventListener('click', function() {
		loadCategory(category);
	}, false);
	
	var templateData = data[category].items[index];
	templateData.category = category;
	main.innerHTML = new EJS({url: 'templates/image.ejs'}).render(templateData);
	
}

function loadData(callback) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', './data.json', true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				data = JSON.parse(xhr.responseText);
				callback();
			} else {
				main.innerHTML = new EJS({url: 'templates/error.ejs'}).render({
					message: 'Unable to load data.'
				});
				document.getElementById('retryButton').addEventListener('click', callback, false);
			}
		}
	};
	xhr.send();
}

window.addEventListener('load', init, false);
window.addEventListener('hashchange', navigate, false);