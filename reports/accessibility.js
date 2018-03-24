const constants = require('../utils/constants');

function checkAltImages(images) {
  let points = 0;
  for (let img of images) {
    if (typeof img.alt !== 'undefined' && img.alt.length > 0) {
      points++;
    }
  }

  return points/images.length;
}

function checkLinksContent(links) {
  let points = 0;
  for (let link of links) {
    if (typeof link.content !== 'undefined' && link.content.length > 0) {
      points++;
    }
  }

  return points/links.length;
}

function checkLang(htmlTag) {
  if (typeof htmlTag.lang === 'undefined') return 0;

  let found = false;
  for (let lang of constants.languages) {
    if (htmlTag.lang.indexOf(lang.iso_code) > -1) {
      found = true;
    }
  }

  return found ? 1 : 0;
}

function checkScalability(metas) {
  let viewport = metas['viewport'];
  if (typeof viewport === 'undefined') return 0;

  let points = 0;
  let attributes = viewport.split(',');
  let user_scalable = '';
  let initial_scale = 0;
  let minimum_scale = 0;
  let maximum_scale = 0;

  for (let attr of attributes) {
    if (attr.indexOf('user-scalable') > -1) {
      user_scalable = attr.split('=').slice(-1);
    } else if (attr.indexOf('initial_scale') > -1) {
      initial_scale = parseFloat(attr.split('=').slice(-1));
    } else if (attr.indexOf('minimum-scale') > -1) {
      minimum_scale = parseFloat(attr.split('=').slice(-1));
    } else if (attr.indexOf('maximum-scale') > -1) {
      maximum_scale = parseFloat(attr.split('=').slice(-1));
    }
  }

  if (user_scalable == 'yes' || parseFloat(user_scalable) > 0) points++;
  if (minimum_scale < maximum_scale || initial_scale < maximum_scale) points++;

  return points/2;
}

function checkTitle(title) {
  return (title !== '' && title.length > 4 && title.length < 80) ? 1 : 0;
}

function checkLists($) {
  let points = 0;
  let $liElements = $('body').find('li');

  $liElements.each(function() {
    let parentTag = $(this).parent().prop("tagName");
    if (parentTag == 'UL' || parentTag == 'OL') points++;
  });

  return points/$liElements.length;
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

function generateSummary(jsonDocument, $) {
  return {
    imgs: checkAltImages(jsonDocument.images),
    links: checkLinksContent(jsonDocument.links),
    lang: checkLang(jsonDocument.html),
    scalable: checkScalability(jsonDocument.head.metas),
    title: checkTitle(jsonDocument.head.title),
    lists: checkLists($)
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
  checkAltImages,
  checkLinksContent,
  checkLang,
  checkScalability,
  checkTitle,
  checkLists,
  getScore,
  generateSummary,
  comprehensiveAnalysis
};
