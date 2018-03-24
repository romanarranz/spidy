const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const cheerio = require('cheerio');
var program = require('commander');

const manifest = require('./package.json');
const headers = require('./tools/headers');
const network = require('./tools/network');
const document = require('./tools/document');
const navigation = require('./tools/navigation');
const reports = require('./reports');
const utilities = require('./utils/utilities');
const Chrono = require('./utils/chrono');

require('./utils/prettylog');

var programChrono = new Chrono(4);
var chrono = new Chrono(4);

var selectedUrl = "";
var selectedDevice = "";

program
  .version(manifest.version)
  .arguments('<url> [mobile|tablet]')
  .action(function(url, device) {
    selectedUrl = url;
    selectedDevice = device;
  })
  .option('-s, --screenshot [file]', 'Make a simple screenshot and save it into [file]')
  .option('-f, --to-json [file]', 'Save all the analysis to json [file]')
  .option('-x, --to-xml [file]', 'Save the analysis to xml [file]');

program.on('--help', function() {
  console.log('\n  Examples:');
  console.log('');
  console.log('    $ node index.js -f output/9gag.json http://www.9gag.com');
  console.log('');
});

program.parse(process.argv);

// Graceful exit on Ctrl+C
process.on('SIGINT', function() {
  console.info('Quitting...');
  process.exit();
});

if (typeof selectedUrl === 'undefined' || utilities.validateUrl(selectedUrl) === null) {
  console.error('You need to specify an URL to start!');
  process.exit(1);
}

// Detecting the specified user agent and set the viewport
var viewport = { width: 1280, height: 1024 };
var userAgent = "";
if (selectedDevice == "mobile") {
  viewport = { width: devices['iPhone 6'].viewport.width, height: devices['iPhone 6'].viewport.height };
  userAgent = devices['iPhone 6'].userAgent;
} else if (selectedDevice == "tablet") {
  viewport = { width: devices['iPad'].viewport.width, height: devices['iPad'].viewport.height };
  userAgent = devices['iPad'].userAgent;
}

var fqdn = headers.extractFQDN(selectedUrl);

try {
  init();
} catch(e) {
  console.error('Aborting due to error...');
}

async function init() {
  programChrono.start();

  // Open Headless Chrome
  console.info('Opening headless browser...');
  chrono.start();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  chrono.stop();
  console.info('\t\t', chrono);

  // Open a new tab
  console.info('Opening a new tab...');
  chrono.start();
  const page = await browser.newPage();
  if (userAgent != "") await page.setUserAgent(userAgent);
  await page.setViewport({ width: viewport.width,	height: viewport.height });
  chrono.stop();
  console.info('\t\t', chrono);

  // get responses XHR
  let responses = [];
  page.on('response', function(res) {
    network.getResponses(res, responses);
  });

  // Send to the client the DevTools Protocol commands
  // We need to enable the necessary domains concerning DevTools commands which we are going to use
  const client = page._client;
  await client.send('Page.enable');
  await client.send('DOM.enable');
  await client.send('CSS.enable');
  await client.send('CSS.startRuleUsageTracking');

  // Listen when a stylsheet is added, the payload contains the size of the stylesheet
  const stylesheets = [];
  client.on('CSS.styleSheetAdded', stylesheet => {
    stylesheets.push(stylesheet.header);
  });

  // Go to page!
  console.info('Going to '+selectedUrl+'...');
  chrono.start();
  // we could set the parameter waitUntil: ['load', 'networkidle0'] but it wont work on those webs with infinite scroll
  const res = await page.goto(selectedUrl, { waitUntil: ['load'] });
  const html = await page.content();
  const $ = cheerio.load(html);
  chrono.stop();
  console.info('\t\t', chrono);

  // Do some user interaction like scrolling to force the website to make xhr
  console.info('Navigation: Scrolling through page');
  let scrollOffset = 600;
  await navigation.autoScroll(page, scrollOffset);
  chrono.start();
  chrono.stop();
  console.info('\t\t', chrono);

  // Stop tracking CSS and get ruleUsage data object needed to calc the unused css
  const { ruleUsage } = await client.send('CSS.stopRuleUsageTracking');

  // Extract info about the loaded website or SPA
  console.info('Grabbing info...');
  chrono.start();
  let json = {};
  json.server = headers.comprehensiveExtract(res.url(), res.headers(), res.securityDetails());
  json.document = document.comprehensiveExtract($);
  json.document.stylesheets = document.parseStylesheets(stylesheets);
  json.responses = network.getOrigins(fqdn, responses);
  json.reports = reports.comprehensiveAnalysis(json.document, $, stylesheets, ruleUsage, json.responses);
  chrono.stop();
  console.info('\t\t', chrono);

  chrono.start();

  // save the screenshot
  if (typeof program.screenshot !== 'undefined') {
    await page.screenshot({ path: program.screenshot, fullPage: false });
    console.info('Screenshot '+program.screenshot+' saved!');
  }

  // save analysis to json file
  if ((program.rawArgs.indexOf('--to-json') > -1 || program.rawArgs.indexOf('-f') > -1) && typeof program.toJson !== 'undefined') {
    try {
      console.info('Saving results into '+program.toJson+' ...');
      utilities.jsonToFile(json, program.toJson);
    } catch(e) {
      console.error('Unable to save analysis into '+program.toJson, e);
    }
  }

  // save analysis to xml file
  if ((program.rawArgs.indexOf('--to-xml') > -1 || program.rawArgs.indexOf('-x') > -1) && typeof program.toXml !== 'undefined') {
    try {
      console.info('Saving results into '+program.toXml+' ...');
      utilities.jsonToXmlFile(json, program.toXml);
    } catch(e) {
      console.error('Unable to save analysis into '+program.toXml, e);
    }
  }

  chrono.stop();
  console.info('\t\t', chrono);

  // Bye browser!
  await browser.close();

  programChrono.stop();
  console.info('The program finished in', programChrono);
}
