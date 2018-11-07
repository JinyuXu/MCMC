const assert = require('assert');
const mcmc = require('../index.js');

describe('mcmc', () => {
  it('has a test', () => {
    assert(true, 'mcmc should have a test');
  });
});

describe('MCpoint', () => {
  it('Sum is correct', () => {
    let testnum = new mcmc.MCpoint(1, 2);
    assert(testnum.pointsum() === 3);
  });
});
