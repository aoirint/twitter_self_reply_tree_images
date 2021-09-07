getTweetIndex = function(element) {
	while (element != null && element.tagName != 'ARTICLE') {
		element = element.parentElement;
	}
	if (element == null) return -1;
	const transform = element.parentElement.parentElement.parentElement.style.transform;
	const transformYValue = transform.slice(transform.lastIndexOf('(')+1, transform.indexOf(')')-2);
	return parseFloat(transformYValue);
}
getImageIndexInTweet = function(element) {
	while (element != null && element.tagName != 'A') {
		element = element.parentElement;
	}
	if (element == null) return -1;
	const [,imageIndex] = element.href.match(/photo\/(\d+)$/);
	return parseInt(imageIndex);
}

mediaTweetIndexes = [];
mediaImageIndexes = [];
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
	.map((e) => [ getTweetIndex(e), getImageIndexInTweet(e), e.src ])
	// tweetIndex, imageIndex, imageSrc
	.filter(([ti, ii, s]) => s.startsWith('https://pbs.twimg.com/media/'))
	.map(([ti, ii, s]) => [ ti, ii, s.slice(0,s.lastIndexOf('&'))+'&name=4096x4096', s.slice(s.lastIndexOf('/')+1, s.lastIndexOf('?')), new URL(s).searchParams.get('format') ])
	// tweetIndex, imageIndex, imageSrc, imageId, imageExtension
	.filter(([ti, ii, s, d, e]) => ! mediaUrls.includes(s))
	.forEach(([ti, ii, s, d, e]) => { mediaTweetIndexes.push(ti); mediaImageIndexes.push(ii); mediaUrls.push(s); mediaIds.push(d); mediaExts.push(e); });
}
updateGifVideos = function() {
	const primaryColumn = document.querySelector('div[data-testid="primaryColumn"]');
	const tweetGifVideos = Array.from(primaryColumn.querySelectorAll('div[data-testid="placementTracking"] video'));
	tweetGifVideos
	.map((e) => [ getTweetIndex(e), getImageIndexInTweet(e), e.src ])
	.filter(([ti, ii, s]) => s.startsWith('https://video.twimg.com/'))
	.map(([ti, ii, s]) => [ ti, ii, s, s.slice(s.lastIndexOf('/')+1, s.lastIndexOf('.')), s.substr(s.lastIndexOf('.')+1) ])
	.filter(([ti, ii, s, d, e]) => ! mediaUrls.includes(s))
	.forEach(([ti, ii, s, d, e]) => { mediaTweetIndexes.push(ti); mediaImageIndexes.push(ii); mediaUrls.push(s); mediaIds.push(d); mediaExts.push(e); });
}

zfill = function(num, digits) {
	const numString = new String(num);
	return Array(Math.max(0, digits - numString.length)).fill('0').join('') + numString;
}

listAll = function() {
	const [,username,tweetId] = location.href.match(/twitter\.com\/(.+)\/status\/(.+)$/);
	let mapping = mediaUrls.map((s, i) => [ mediaTweetIndexes[i], mediaImageIndexes[i], s, mediaIds[i], mediaExts[i] ]);
	mapping.sort(([ii1, ti1, s1, d1, e1], [ii2, ti2, s2, d2, e2]) => {
        const c1 = ii1 - ii2;
        if (c1 !== 0) return c1;
        return ti1 - ti2;
    }); // asc
	const directory = `twitter/${username}_${tweetId}`
	const result = mapping.map(([_, __, s, d, e], i) => [s,directory+'/'+tweetId+'_'+zfill(i, 3)+'_'+d+'.'+e]).map(a => a.join(' ')).join('\n');
	console.log(directory + '\n' + result);
}

setInterval(() => { update(); listAll(); }, 500);