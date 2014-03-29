var data;
var main;
var templates = {
	categories: null,
	category: null,
	error: null,
	image: null
};

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

function loadTemplates(callback) {
	var templatesLoaded = 0;
	
	var processTemplate = function(e) {
		if (e.target.readyState === 4) {
			if (e.target.status === 200) {
				// Create an element to hold the template.
				//templates[e.target.templateName] = document.createElement('div');
				templates[e.target.templateName] = e.target.responseText;
				if (++templatesLoaded === Object.keys(templates).length) {
					if (callback) {
						callback();
					}
				}
			}
		}
	}
	for (template in templates) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'templates/' + template + '.hbs', true);
		xhr.onreadystatechange = processTemplate;
		xhr.templateName = template;
		xhr.send();
	}
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
	document.getElementById('titleButton').disabled = true;
	document.getElementById('titleButton').classList.remove('holo-up');
	document.getElementById('titleButton').removeEventListener('click', loadCategories, false);
	
	// Clear the main section.
	main.innerHTML = '';
	// Create the list.
	var list = document.createElement('ul');
	list.className = 'holo-list';
	// For each item in the category...
	for (category in data) {
		// Create the list item.
		var listItem = document.createElement('li');
		// Create the item button.
		var itemLink = document.createElement('a');
		itemLink.setAttribute('role', 'button');
		itemLink.href = '#' + category;
		itemLink.innerText = itemLink.textContent = data[category].name;
		// Add the button to the list item.
		listItem.appendChild(itemLink);
		// Add the item to the list.
		list.appendChild(listItem);
	}
	// Add the list to the main section.
	main.appendChild(list);
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
	document.getElementById('titleButton').disabled = false;
	document.getElementById('titleButton').classList.add('holo-up');
	document.getElementById('titleButton').addEventListener('click', loadCategories, false);
	
	// Clear the main section.
	main.innerHTML = '';
	// Create the list.
	var list = document.createElement('ul');
	list.className = 'holo-list';
	// For each item in the category,
	for (item in data[category].items) {
		// Create the list item.
		var listItem = document.createElement('li');
		// Create the item button.
		var itemLink = document.createElement('a');
		itemLink.setAttribute('role', 'button');
		itemLink.href = '#' + category + '/' + item;
		itemLink.innerText = itemLink.textContent = data[category].items[item].name;
		// Add the button to the list item.
		listItem.appendChild(itemLink);
		// Add the item to the list.
		list.appendChild(listItem);
	}
	// Add the list to the main section.
	main.appendChild(list);
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
	document.getElementById('titleButton').disabled = false;
	document.getElementById('titleButton').classList.add('holo-up');
	document.getElementById('titleButton').addEventListener('click', function() {
		loadCategory(category);
	}, false);
	
	// Clear the main section.
	main.innerHTML = '';
	// Create the image element.
	var image = document.createElement('img');
	// Load the image.
	image.src = 'images/' + category + '/' + data[category].items[index].file;
	image.style.display = 'block';
	image.style.maxWidth = '100%';
	image.style.marginTop = '16px';
	// Create the link text box.
	var linkBox = document.createElement('input');
	linkBox.type = 'text';
	linkBox.value = data[category].items[index].url;
	linkBox.style.display = 'block';
	linkBox.style.width = '100%';
	// Add the image to the main section.
	main.appendChild(image);
	// Add the link box to the main section.
	main.appendChild(linkBox);
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