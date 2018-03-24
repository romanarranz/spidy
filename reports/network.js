function calcMetrics(responses, code) {
  if (responses.length == 0) return 0;

  let points = 0;
  for (let res of responses) {
    if (res.status == code) points++;
  }

  return points/responses.length;
}

function calc200Metrics(responses) {
  return calcMetrics(responses, 200);
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

function generateSummary(responses) {
  return {
    internal_200: calc200Metrics(responses.internal),
    external_200: calc200Metrics(responses.external),
  };
}

function comprehensiveAnalysis(responses) {
  let summary = generateSummary(responses);

  return {
    score: getScore(summary),
    summary
  };
}

module.exports = {
  calcMetrics,
  comprehensiveAnalysis
}
