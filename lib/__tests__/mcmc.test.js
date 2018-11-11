const assert = require('assert');
const mcmc = require('../index.js');
const jsnx = require('jsnetworkx');

describe('MCMC', () => {
  it('distance calculation is correct.', () => {
    let g = new jsnx.Graph();
    g.addNode(0, { coordinate: [0, 0] });
    g.addNode(1, { coordinate: [1, 0] });
    assert(mcmc.distance(g, 0, 1) === 1, 'Distance calculation has error.');
  });

  it('Graph is correctly generated.', () => {
    let g = mcmc.createGraph(3, [[0, 0], [1, 0], [2, 0]]);
    assert(g.nodes().length === 3, 'Graph is not created correctly');
    assert(g.edges().length === 2, 'Graph is not generated correctly.');
  });

  it('Is an edge correctly checked as a bridge?', () => {
    let g = mcmc.createGraph(3, [[0, 0], [1, 0], [2, 0]]);
    assert(mcmc.checkBridge(g, 0, 1), 'CheckBridge function contains error.');
  });

  it('Is q for deletion correctly calculated', () => {
    let g = mcmc.createGraph(3, [[0, 0], [1, 0], [2, 0]]);
    g.addEdge(0, 2);
    assert(mcmc.qdeletion(g) === 1 / 3, 'q deletion is not correctly calculated.');
  });

  it('Is check conneted function working correctly', () => {
    let g = mcmc.createGraph(3, [[0, 0], [1, 0], [2, 0]]);
    assert(mcmc.checkConnected(g), 'Check Edge function is not correct.');
    g.removeEdge(0, 1);
    assert(!mcmc.checkConnected(g), 'Check Edge function is not correct.');
  });

  it('Is function for checking edge existance working correctly', () => {
    let g = mcmc.createGraph(3, [[0, 0], [1, 0], [2, 0]]);
    assert(mcmc.checkEdge(g, 0, 1), 'Check Edge function is not working well.');
    assert(!mcmc.checkEdge(g, 0, 2), 'Check Edge function is not working well.');
  });

  it('Is q for addition correclty calculated', () => {
    let g = new jsnx.Graph();
    g.addNodesFrom([0, 1, 2]);
    g.addEdgesFrom([[0, 1], [1, 2]]);
    assert(mcmc.qaddition(g) === 1, 'q addition is not correctly calclated.');
  });

  it('Addition or Deletion', () => {
    let g = mcmc.createGraph(3, [[0, 0], [1, 0], [2, 0]]);
    assert(mcmc.toBeOrNotToBe(g), 'A/D function is not working correctly.');
    g.addEdge(0, 2);
    assert(!mcmc.toBeOrNotToBe(g), 'A/D function is not working correctly.');
  });

  it('Add random edge', () => {
    let g = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    g.addEdge(0, 3);
    let h = mcmc.addRandomEdge(g);
    let i = mcmc.addRandomEdge(h);
    assert(i.edges().length === 6, 'Error in addition of random edge');
  });

  it('Remove random edge', () => {
    let g = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    g.addEdge(0, 3);
    let h = mcmc.removeRandomEdge(g);
    let i = mcmc.removeRandomEdge(h);
    assert(i.edges().length === 4, 'Error in addition of random edge');
    assert(
      mcmc.checkConnected(g),
      'The function does not ensure the connectivity of the graph.'
    );
  });

  it('Transition graph', () => {
    let g = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    let gi = mcmc.transitionGraph(g);
    assert(gi.edges().length === g.edges().length);
    assert(gi.nodes().length === g.nodes().length);
  });

  it('Calculate theta', () => {
    let g = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    assert(mcmc.theta(g, 1, 0) === 9);
  });

  it('Calcalate pi', () => {
    let g = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    let h = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    h.addWeightedEdgesFrom([[0, 3, mcmc.distance(h, 0, 3)]]);
    assert(mcmc.piRatio(g, h, 1, 1, 0) === Math.exp(1));
  });

  it('expected value', () => {
    let arr = [0, 1, 2];
    assert(mcmc.expectedValue(arr) === 1);
  });

  it('edge connected to source', () => {
    let g = new jsnx.Graph();
    g.addNodesFrom([0, 1, 2, 3]);
    g.addEdgesFrom([[0, 1], [1, 2], [2, 3]]);
    assert(mcmc.edgeConnectedToSource(g, 0) === 1);
  });

  it('Maximum distance', () => {
    let g = new jsnx.Graph();
    g.addNodesFrom([0, 1, 2, 3]);
    g.addEdgesFrom([[0, 1], [1, 2], [2, 3]]);
    assert(mcmc.maxDistance(g, 0) === 3);
  });

  it('qadd or qdel?', () => {
    let g = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    let h = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    h.addWeightedEdgesFrom([[0, 3, mcmc.distance(h, 0, 3)]]);
    assert(mcmc.q(g, h) === mcmc.qaddition(g));
  });

  it('check default', () => {
    let testinput = [];
    let defaultsituation = mcmc.defaultinput(testinput);
    assert(defaultsituation.Number === 5);
    assert(defaultsituation.Coordinate === '0,0,1,0,0,1,-1,0,0,-1');
    assert(defaultsituation.Iterations === 100);
    assert(defaultsituation.r === 1);
    assert(defaultsituation.T === 1);
  });
});
