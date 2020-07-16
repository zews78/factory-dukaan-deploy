const punctuationMarks = require('./punctuationMarks');
const searchExcludingWords = require('./searchExcludingWords');

module.exports = str => {
	let strWithoutPunc = '';

	for (const i in str)
		if (punctuationMarks.includes(str[i])) strWithoutPunc += ' ';
		else strWithoutPunc += str[i].toLowerCase();

	const keywords = strWithoutPunc.trim()
		.split(' ');

	const finalKeywords = [];
	for (const i in keywords)
		if (!searchExcludingWords.includes(keywords[i]))
			finalKeywords.push(keywords[i]);

	return finalKeywords;
};
