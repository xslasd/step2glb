import fs from 'fs';
import axios from 'axios';

export const FileSource =
{
	Url: 1,
	File: 2,
	Decompressed: 3
};

export const FileFormat =
{
	Text: 1,
	Binary: 2
};

export function GetFileName (filePath) {
	let firstSeparator = filePath.lastIndexOf('/');
	if (firstSeparator === -1) {
		firstSeparator = filePath.lastIndexOf('\\');
	}
	let fileName = filePath;
	if (firstSeparator !== -1) {
		fileName = filePath.substring(firstSeparator + 1);
	}
	let firstParamIndex = fileName.indexOf('?');
	if (firstParamIndex !== -1) {
		fileName = fileName.substring(0, firstParamIndex);
	}
	return decodeURI(fileName);
}

export function GetFileExtension (filePath) {
	let fileName = GetFileName(filePath);
	let firstPoint = fileName.lastIndexOf('.');
	if (firstPoint === -1) {
		return '';
	}
	let extension = fileName.substring(firstPoint + 1);
	return extension.toLowerCase();
}

export function RequestUrl (url, onProgress) {
	return new Promise((resolve, reject) => {
		axios.get(url, {
			responseType: 'arraybuffer',
			onDownloadProgress: function (event) {
				onProgress(event.loaded, event.total);
			}
		}).then(function (res) {
			if (res.status == 200) {
				resolve(res.data);
			} else {
				reject();
			}
		}).catch(function (error) {
			reject();
		})
	});
}

function toArrayBuffer (buf) {
	var ab = new ArrayBuffer(buf.length);
	var view = new Uint8Array(ab);
	for (var i = 0; i < buf.length; ++i) {
		view[i] = buf[i];
	}
	return ab;
}

export function ReadFile (src, onProgress) {
	return new Promise((resolve, reject) => {
		let readStream = fs.createReadStream(src)
		let totalSize = fs.statSync(src).size
		let curSize = 0
		let data = ''
		readStream.on('data', (chunk) => {
			curSize += chunk.length
			data += chunk
			onProgress(curSize, totalSize);
		})
		readStream.on('end', () => {
			resolve(toArrayBuffer(Buffer.from(data)))
		})
		readStream.on('error', () => {
			reject();
		})
	});
}

export function TransformFileHostUrls (urls) {
	for (let i = 0; i < urls.length; i++) {
		let url = urls[i];
		if (url.search(/www\.dropbox\.com/u) !== -1) {
			url = url.replace('www.dropbox.com', 'dl.dropbox.com');
			let separatorPos = url.indexOf('?');
			if (separatorPos !== -1) {
				url = url.substring(0, separatorPos);
			}
			urls[i] = url;
		} else if (url.search(/github\.com/u) !== -1) {
			url = url.replace('github.com', 'raw.githubusercontent.com');
			url = url.replace('/blob', '');
			let separatorPos = url.indexOf('?');
			if (separatorPos !== -1) {
				url = url.substring(0, separatorPos);
			}
			urls[i] = url;
		}
	}
}

export function IsUrl (str) {
	const regex = /^https?:\/\/\S+$/g;
	const match = str.match(regex);
	return match !== null;
}
