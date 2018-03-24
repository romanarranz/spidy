const supertrim = require('../utils/utilities').supertrim;

function getHtmlTag($) {
  let lang = typeof $('html').attr('lang') !== 'undefined' ? $('html').attr('lang') : '';
  return { lang };
}

function getH1($) {
  let h1 = [];

  $('h1').each(function() {
    h1.push(supertrim($(this).text()));
  });

  return h1;
}

function getH2($) {
  let h2 = [];

  $('h2').each(function() {
    h2.push(supertrim($(this).text()));
  });

  return h2;
}

function getLinks($) {
  let links = [];

  $('a').each(function() {
    let href = $(this).attr('href');
    let content = supertrim($(this).text());

    // skip case
    if (typeof href === 'undefined') return;
    if (href.indexOf('javascript') > -1) return;
    if (href.indexOf('#') > -1) return;

    links.push({ href, content });
  });

  return links;
}

function getTitle($) {
  return $('head title').length > 0 ? $('head title').text() : '';
}

function getHreflang($) {
  let hreflangs = [];
  $('link[rel="alternate"]').each(function() {
    if ($(this).attr('hreflang') !== '' && typeof $(this).attr('hreflang') !== 'undefined') {
      hreflangs.push({ lang: $(this).attr('hreflang'), href: $(this).attr('href') });
    }
  });

  return hreflangs;
}

function getImages($) {
  let images = [];

  $('img').each(function() {
    let url = $(this).attr('src');
    let alt = $(this).attr('alt');
    images.push({ url, alt });
  });

  return images;
}

function getIds($) {
  let ids = [];

  $('[id]').each(function() {
    ids.push($(this).attr('id'));
  });

  return ids;
}

function getMetas($) {
  let meta = {};
  meta.canonical = typeof $('link[rel="canonical"]').attr('href') !== 'undefined' ? $('link[rel="canonical"]').attr('href') : '?';

  $('meta').each(function() {
    let attribs = $(this)[0].attribs;
    let pair = { attr: '', content: '' };

    // classify the pair key-val
    for (let key in attribs) {
      if (key != "content") {
        pair.attr = attribs[key];
      } else {
        pair.content = attribs[key];
      }
    }

    meta[pair.attr] = pair.content;
  });

  return meta;
}

function getComments($) {
  let comments = [];

  $("html, head, body").contents().filter(function(){
    return this.nodeType == 8;
  }).each(function(i, e){
    comments.push(supertrim(e.nodeValue));
  });

  return comments;
}

function getStylesheets($) {
  let stylesheets = [];

  $('link[rel="stylesheet"]').each(function() {
    stylesheets.push($(this).attr('href'));
  });

  return stylesheets;
}

function getScripts($) {
  let scripts = { sync: [], async: [] };

  $('script').each(function() {
    // without a src there is nothing to do
    if (typeof $(this).attr('src') !== 'undefined') {
      if (typeof $(this).attr('async') !== 'undefined') {
        scripts.async.push($(this).attr('src'));
      } else {
        scripts.sync.push($(this).attr('src'));
      }
    }
  });

  return scripts;
}

function parseStylesheets(stylesheets) {
  let urls = [];
  for (let css of stylesheets) {
    if (css.sourceURL !== '') urls.push(css.sourceURL);
  }

  return urls;
}

function comprehensiveExtract($) {
  return {
    html: getHtmlTag($),
    head: {
      metas: getMetas($),
      title: getTitle($),
      hreflangs: getHreflang($)
    },
    stylesheets: getStylesheets($),
    scripts: getScripts($),
    comments: getComments($),
    links: getLinks($),
    images: getImages($),
    content: {
      h1: getH1($),
      h2: getH2($),
      ids: getIds($)
    }
  };
}

module.exports = {
  getLinks,
  getImages,
  getMetas,
  getComments,
  getStylesheets,
  getScripts,
  parseStylesheets,
  comprehensiveExtract
};
