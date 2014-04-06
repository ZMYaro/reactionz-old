

function loadData(callback) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', './data.json', true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				data = JSON.parse(xhr.responseText);
				callback();
			} else {
				errorPage('Unable to load data.', callback);
			}
		}
	};
	xhr.send();
}

/**
 * Load an external file and return it as a data: URL
 * @param {String} url - The URL from which to retrieve the file
 * @param {Function} callback - The function to which to pass the blob: URL
 * @param {Function} errorCallback - The function to call if the request fails
 */
function loadFileFromURL(url, callback, errorCallback) {
	'use strict';
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'blob';
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				// Create a FileReader to read the response.
				var reader = new FileReader();
				// When the reader has read the response, pass it to the callback.
				reader.onload = function (e) {
					callback(reader.result);
				};
				// Read the response as a data: URL
				reader.readAsDataURL(xhr.response);
			} else {
				errorCallback(xhr.status);
			}
		}
	};
	xhr.send();
}

/**
 * Attempt to load a file from local storage, then fall back to an external URL
 * @param {String} url - The URL where the original file was hosted
 * @param {Function} callback - The function to which to pass the blob: URL
 * @param {Function} errorCallback - The function to call if the file cannot be retrieved
 */
function loadFile(url, callback, errorCallback) {
	'use strict';
	chrome.storage.local.get(url, function (items) {
		if (!items[url]) {
			loadFileFromURL(url, callback, errorCallback);
		} else {
			callback(items[url]);
		}
	});
}