const rp = require('request-promise');
require('../utils/prettylog');

/**
* Make multiple requests and retrieve the results whether its success or not, each of them
*
* @param {array} urls
* @return {array}
*/
async function multipleRequest(urls) {
  let responsesAndErrors = [];
  try {
    let promises = urls.map(function(url) {
      let options = {
        uri: url,
        resolveWithFullResponse: true
      };

      return rp(options).catch(function(err) { return err; });
    });

    const resList = await Promise.all(promises);

    resList.forEach(function(res) {
      // error case
      if (typeof res.name === 'string') responsesAndErrors.push(-1);
      else responsesAndErrors.push(res.statusCode);
    });
  } catch(e) {
    console.error(e);
  }

  return responsesAndErrors;
}

/**
* Callback used to get all the XHR responses and store the response object into a store.
* Also this fn is able to skip those long strings about data:image used to encode base64 images
*
* @param {object} res
* @param {array} store
*/
function getResponses(res, store) {
  const req = res.request();
  const httpMethod = req.method();
  const statusCode = res.status();
  const url = req.url();
  if (url.indexOf('data:image') == -1) store.push({ method: httpMethod, status: statusCode, url });
}

function getOrigins(fqdn, responses) {
  let internal = [];
  let external = [];

  for (let res of responses) {

    let urlFqdn = res.url.split('/')[2];
    if (urlFqdn == fqdn) {
      internal.push(res);
    } else {
      external.push(res);
    }
  }

  return { internal, external };
}

module.exports = {
  multipleRequest,
  getResponses,
  getOrigins
};
