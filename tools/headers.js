const isFunction = require('../utils/utilities').isFunction;
require('../utils/prettylog');

function extractFQDN(url) {
  return url.split('/')[2];
}

function isCached(headers) {
  let cached = headers['cache-control'];
  if (typeof cached === 'undefined') return '?';
  return cached == 'no-cache' ? 'no' : 'yes';
}

function hasXssProtection(headers) {
  let xss = headers['x-xss-protection'];
  if (typeof xss === 'undefined') return '?';
  return xss.split(';')[0] == 1 ? 'yes' : 'no';
}

function isGzipped(headers) {
  let gzip = headers['content-encoding'];
  if (typeof gzip === 'undefined') return '?';
  return gzip == 'gzip' ? 'yes' : 'no';
}

function getServer(headers) {
  let srv = headers['server'];
  if (typeof srv === 'undefined') return '?';
  return srv;
}

function getCertSubject(cert) {
  let subject;
  try {
    subject = cert['subjectName']();
  } catch(e) {
    console.error(e);
    subject = '?';
  }

  return subject.length > 0 ? subject : '?';
}

function getCertIssuer(cert) {
  let issuer;
  try {
    issuer = cert['issuer']();
  } catch(e) {
    console.error(e);
    issuer = '?';
  }

  return issuer.length > 0 ? issuer : '?';
}

function getCertEmission(cert) {
  let emission;
  try {
    emission = cert['validFrom']();
  } catch(e) {
    console.error(e);
    emission = '?';
  }

  return emission;
}

function getCertExpiration(cert) {
  let expiration;
  try {
    expiration = cert['validTo']();
  } catch(e) {
    console.error(e);
    expiration = '?';
  }

  return expiration;
}

function getCertProtocol(cert) {
  let proto;
  try {
    proto = cert['protocol']();
  } catch(e) {
    console.error(e);
    proto = '?';
  }

  return proto;
}

function comprehensiveExtract(url, headers, cert) {
  let certEmissionUnixtime = getCertEmission(cert);
  let certExpirationUnixtime = getCertExpiration(cert);

  let d = new Date(0);
  d.setUTCSeconds(certEmissionUnixtime);
  let certEmissionISODate = d.toISOString();

  d = new Date(0);
  d.setUTCSeconds(certExpirationUnixtime);
  let certExpirationISODate = d.toISOString();

  return {
    server: getServer(headers),
    fqdn: extractFQDN(url),
    gzip: isGzipped(headers),
    cache_control: isCached(headers),
    security: {
      xss_protected: hasXssProtection(headers),
      cert_subject: getCertSubject(cert),
      cert_issuer: getCertIssuer(cert),
      cert_emission_unixtme: certEmissionUnixtime,
      cert_expiration_unixtime: certExpirationUnixtime,
      cert_emission_date: certEmissionISODate,
      cert_expiration_date: certExpirationISODate,
      cert_protocol: getCertProtocol(cert)
    }
  };
}

module.exports = {
  extractFQDN,
  comprehensiveExtract
};
