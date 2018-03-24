const accessibility = require('./accessibility');
const seo = require('./seo');
const styles = require('./styles');
const network = require('./network');

function comprehensiveAnalysis(json, $, stylesheets, cssRuleUsage, responses) {
  return {
    accessibility: accessibility.comprehensiveAnalysis(json, $),
    seo: seo.comprehensiveAnalysis(json, $),
    styles: styles.comprehensiveAnalysis(stylesheets, cssRuleUsage),
    network: network.comprehensiveAnalysis(responses)
  }
}

module.exports = {
  accessibility,
  seo,
  comprehensiveAnalysis
};
