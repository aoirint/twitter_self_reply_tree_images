getElementIndex = function(element) {
	while (element != null && element.tagName != 'ARTICLE') {
		element = element.parentElement;
	}
	if (element == null) return -1;
	const transform = element.parentElement.parentElement.parentElement.style.transform;
	const transformYValue = transform.slice(transform.lastIndexOf('(')+1, transform.indexOf(')')-2);
	return parseFloat(transformYValue);
}

mediaIndexes = [];
mediaUrls = [];
mediaIds = [];
mediaExts = [];

update = function() {
	updateImages();
	updateGifVideos();
}
updateImages = function() {
	const primaryColumn = document.querySelector('div[data-testid="primaryColumn"]');
	const tweetPhotos = Array.from(primaryColumn.querySelectorAll('div[data-testid="tweetPhoto"] img'));
	tweetPhotos
	.map((e) => [ getElementIndex(e), e.src ])
	// imageElementIndex, imageSrc
	.filter(([i, s]) => s.startsWith('https://pbs.twimg.com/media/'))
	.map(([i, s]) => [ i, s.slice(0,s.lastIndexOf('&'))+'&name=4096x4096', s.slice(s.lastIndexOf('/')+1, s.lastIndexOf('?')), new URL(s).searchParams.get('format') ])
	// imageElementIndex, imageSrc, imageId, imageExtension
	.filter(([i, s, d, e]) => ! mediaUrls.includes(s))
	.forEach(([i, s, d, e]) => { mediaIndexes.push(i); mediaUrls.push(s); mediaIds.push(d); mediaExts.push(e); });
}
updateGifVideos = function() {
	const primaryColumn = document.querySelector('div[data-testid="primaryColumn"]');
	const tweetGifVideos = Array.from(primaryColumn.querySelectorAll('div[data-testid="placementTracking"] video'));
	tweetGifVideos
	.map((e) => [ getElementIndex(e), e.src ])
	.filter(([i, s]) => s.startsWith('https://video.twimg.com/'))
	.map(([i, s]) => [ i, s, s.slice(s.lastIndexOf('/')+1, s.lastIndexOf('.')), s.substr(s.lastIndexOf('.')+1) ])
	.filter(([i, s, d, e]) => ! mediaUrls.includes(s))
	.forEach(([i, s, d, e]) => { mediaIndexes.push(i); mediaUrls.push(s); mediaIds.push(d); mediaExts.push(e); });
}

zfill = function(num, digits) {
	const numString = new String(num);
	return Array(Math.max(0, digits - numString.length)).fill('0').join('') + numString;
}

listAll = function() {
	const [,username,tweetId] = location.href.match(/twitter\.com\/(.+)\/status\/(.+)$/);
	let mapping = mediaUrls.map((s, i) => [ mediaIndexes[i], s, mediaIds[i], mediaExts[i] ]);
	mapping.sort(([i1, s1, d1, e1], [i2, s2, d2, e2]) => i1 - i2); // asc
	const directory = `twitter/${username}_${tweetId}`
	const result = mapping.map(([_, s, d, e], i) => [s,directory+'/'+tweetId+'_'+zfill(i+1, 3)+'_'+d+'.'+e]).map(a => a.join(' ')).join('\n');
	console.log(directory);
	console.log(result);
}

setInterval(() => { update(); listAll(); }, 500);