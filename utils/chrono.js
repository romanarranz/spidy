function Chrono(precision) {
  this.precision = precision;
  this.tstart = 0;
  this.tend = 0;
}

Chrono.prototype.start = function() {
  this.tstart = process.hrtime();
};

Chrono.prototype.stop = function() {
  this.tend = process.hrtime();
};

/**
* Apply method used to print the object on console log
* @param {number} depth
* @param {object} opts
* @return {string}
*/
Chrono.prototype.inspect = function(depth, opts) {
  let elapsedSec = this.tend[0] - this.tstart[0];
  let startMs = this.tstart[1]/1000000;
  let endMs = this.tend[1]/1000000;
  let elapsedMs = Math.abs(endMs - startMs);

  return elapsedSec+'s '+elapsedMs.toFixed(this.precision)+ 'ms';
};

module.exports = Chrono;
