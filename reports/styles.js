/**
* Retrieve the usage length of a css file respect all the rest of stylesheets
*
* @param {object} stylesheet
* @param {object} relUsage
* @return {number}
*/
function calcUsedLength(stylesheet, ruleUsage) {
  const cssRules = ruleUsage.filter(function(y) {
    return y.styleSheetId === stylesheet.styleSheetId;
  });

  return cssRules.reduce(function(sum, x) {
    return sum + x.endOffset - x.startOffset;
  }, 0);
}

/**
* Calc the unused percentage of all stylesheets
*
* @param {array} stylesheets
* @param {object} ruleUsage
* @return {number}
*/
function calcUnusedCss(stylesheets, ruleUsage) {
  let used = 0;
  let total = 0;

  for (let css of stylesheets) {
    used += calcUsedLength(css, ruleUsage);
    total += css.length;
  }

  return 100 - Math.round(used/total * 100);
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

function generateSummary(stylesheets, ruleUsage) {
  return {
    unused_css: calcUnusedCss(stylesheets, ruleUsage)/100
  };
}

function comprehensiveAnalysis(stylesheets, ruleUsage) {
  let summary = generateSummary(stylesheets, ruleUsage);

  return {
    score: getScore(summary),
    summary
  };
}

module.exports = {
  calcUnusedCss,
  comprehensiveAnalysis
}
