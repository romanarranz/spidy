const utilities = require('../utils/utilities');
const text = require('../tools/text');

function checkMetaViewport(metas) {
  let viewport = metas['viewport'];
  if (typeof viewport === 'undefined') return 0;
  return (viewport.indexOf('width') > -1 || viewport.indexOf('initial-state') > -1) ? 1 : 0;
}

function checkTitle(title) {
  if (title == '') return 0;
  return (title.length > 4 && title.length < 80) ? 1 : 0;
}

function checkDescription(metas) {
  let description = metas['description'];
  if (typeof description === 'undefined') return 0;
  return (description.length > 35 && description.length < 150) ? 1 : 0;
}

function checkRobots(metas) {
  let robots = metas['robots'];
  if (typeof robots === 'undefined') return 0;

  let attribs = robots.split(',');
  if (attribs.length < 2) return 0;

  let index = attribs[0].toLowerCase();
  let follow = attribs[1].toLowerCase();

  return (index == 'index' && (follow == 'follow' || follow == 'nofollow')) ? 1 : 0;
}

function checkHreflang(head) {
  let hreflangs = head.hreflangs;
  if (hreflangs.length == 0) return 0;

  let points = 0;
  for (let lang of hreflangs) {
    if (lang.href !== '') points++;
  }

  return points/hreflangs.length;
}

function checkCanonical(metas) {
  let canonical = metas['canonical'];
  if (typeof canonical === 'undefined') return 0;
  return canonical.indexOf('&') > -1 ? 0 : 1;
}

function checkIds(ids) {
  if (ids.length == 0) return 0;
  let points = 0;
  let bag = text.bagOfWords(ids);
  let bagLength = 0;

  for (let word in bag) {
    if (bag[word] == 1) points++;
    bagLength++;
  }

  return points/bagLength;
}

/**
* Verify if the words located in title has coincidences with the words located in h1
* and the body of the document
*
* @param {string} title
* @param {array} h1List
* @param {object} $
* @return {number}
*/
function checkComboTitleH1Body(title, h1List, $) {
  if (title == '') return 0;
  if (h1List.length == 0) return 0;

  let bodyText = text.bodyToText($);
  bodyText = utilities.supertrim(bodyText);
  bodyText = utilities.replaceMap(bodyText, { '\n': '', '\t': '', '\r': '' });

  let h1words = [];
  for (let h1 of h1List) {
    h1words = h1words.concat(h1.split(' '));
  }

  let bagOfWordsTitle = text.bagOfWords(title.split(' '));
  let bagOfWordsH1 = text.bagOfWords(h1words);
  let bagOfWordsBody = text.bagOfWords(bodyText.split(' '));

  let points = 0;
  let bagOfWordsTitleLength = 0;
  for (let word in bagOfWordsTitle) {
    if (typeof bagOfWordsH1[word] !== 'undefined' && typeof bagOfWordsBody[word] !== 'undefined') points++;
    bagOfWordsTitleLength++;
  }

  return points/bagOfWordsTitleLength;
}

function getScore(summary) {
  let totalChecks = 0;
  let points = 0;

  for (let key in summary) {
    points += summary[key];
    totalChecks++;
  }

  points = parseFloat(points.toFixed(2));

  return { points, of: totalChecks };
}

function generateSummary(jsonDocument, $, robotsFile) {
  let robots = null;
  if (typeof robotsFile === 'undefined') robots = checkRobots(jsonDocument.head.metas);
  // TODO - check robots file instead

  return {
    viewport: checkMetaViewport(jsonDocument.head.metas),
    title: checkTitle(jsonDocument.head.title),
    description: checkDescription(jsonDocument.head.metas),
    robots,
    hreflang: checkHreflang(jsonDocument.head),
    canonical: checkCanonical(jsonDocument.head.metas),
    ids: checkIds(jsonDocument.content.ids),
    combo_title_h1_body: checkComboTitleH1Body(jsonDocument.head.title, jsonDocument.content.h1, $)
  };
}

function comprehensiveAnalysis(jsonDocument, $) {
  let summary = generateSummary(jsonDocument, $);

  return {
    score: getScore(summary),
    summary
  };
}

module.exports = {
  checkMetaViewport,
  checkTitle,
  checkDescription,
  checkRobots,
  checkHreflang,
  checkCanonical,
  getScore,
  generateSummary,
  comprehensiveAnalysis
};
