/**
* Given a list of words, retrieve a map with the counts of the each words
*
* @param {array} words
* @return {json}
*/
function bagOfWords(words) {
  let json = {};

  for (let w of words) {
    if (typeof json[w] !== 'undefined') {
      json[w] = json[w] + 1;
    } else {
      json[w] = 1;
    }
  }

  return json;
}

function bodyToText($) {
  return $('body').text().toLowerCase();
}

function searchWord(text, word) {
  return text.indexOf(word.toLowerCase()) > -1;
}

module.exports = {
  bagOfWords,
  bodyToText,
  searchWord
};
