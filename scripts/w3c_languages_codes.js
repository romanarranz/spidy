const path = require('path');
const rp = require('request-promise');
const cheerio = require('cheerio');
const jsonToFile = require('../utils/utilities').jsonToFile;
const replaceMap = require('../utils/utilities').replaceMap;

require('../utils/prettylog');

rp('https://www.w3schools.com/tags/ref_language_codes.asp').then(function(html) {
  const $ = cheerio.load(html);
  let languages = [];
  $('table.w3-table-all tbody tr').each(function(index, elem) {
    if (index == 0) return;

    let $language = $($(this).children().get(0));
    let $iso_code = $($(this).children().get(1));

    languages.push({ language: $language.text(), iso_code: $iso_code.text() });
  });

  try {
    jsonToFile(languages, path.join(__dirname, '../resources/iso_639-1_languages.json'));
  } catch(e) {
    throw e;
  }

  return rp('https://www.w3schools.com/tags/ref_country_codes.asp');
})
.then(function(html) {
  const $ = cheerio.load(html);
  let countries = [];
  $('table.w3-table-all tbody tr').each(function(index, elem) {
    if (index == 0) return;

    let $country = $($(this).children().get(0));
    let $iso_code = $($(this).children().get(1));
    $iso_code = replaceMap($iso_code.text(), { '\n': '' });
    console.log($iso_code);

    countries.push({ country: $country.text(), iso_code: $iso_code });
  });

  try {
    jsonToFile(countries, path.join(__dirname, '../resources/iso_639-1_countries.json'));
  } catch(e) {
    throw e;
  }
})
.catch(function(err) {
  console.error(err);
});
