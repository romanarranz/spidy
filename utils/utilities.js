const fs = require('fs');
const js2xmlparser = require("js2xmlparser");

function now() {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

function validateUrl(url) {
  let regexProtocol = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi);
  return url.match(regexProtocol);
}

function jsonToFile(json, path) {
  try {
    fs.writeFileSync(path, JSON.stringify(json, null, 4), 'utf-8');
  } catch(e) {
    throw e;
  }
}

function jsonToXmlFile(json, path) {
  let xml = js2xmlparser.parse("analysis", json);
  strToFile(xml, path);
}

function strToFile(str, path) {
  try {
    fs.writeFileSync(path, str, 'utf-8');
  } catch(e) {
    throw e;
  }
}

function supertrim(str) {
  return str.trim().replace(/\s+/g,' ');
}

function replaceMap(str, simbols) {
  for (let key in simbols) {
    str = str.split(key).join(simbols[key]);
  }

  return str;
}

function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

module.exports = {
  now,
  validateUrl,
  jsonToFile,
  jsonToXmlFile,
  strToFile,
  supertrim,
  replaceMap,
  isFunction
};
