/**
* Callback fn to make some scrolling through the specified page with a maximum offset
*
* @param {object} page
* @param {number} maxScroll
*/
async function autoScroll(page, maxScroll) {
  return page.evaluate(async function(maxScroll) {
    await new Promise(function(resolve, reject) {
      try {
        let lastScroll = 0;
        const interval = setInterval(function() {
          window.scrollBy(0, 100);
          const scrollTop = document.documentElement.scrollTop;
          if (scrollTop === maxScroll || scrollTop === lastScroll) {
            clearInterval(interval);
            resolve();
          } else {
            lastScroll = scrollTop;
          }
        }, 100);
      } catch (e) {
        console.error(e);
        reject(e.toString());
      }
    });
  }, maxScroll);
}

module.exports = {
  autoScroll
};
