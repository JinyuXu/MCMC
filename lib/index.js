'use strict';

const jsnx = require('jsnetworkx');
const cla = require('command-line-args');

function distance(G, node1, node2) {
  /* Calculate the distance between two nodes.
     input: graph; two nodes
     output: distance between nodes */
  let coor1 = G.node.get(node1).coordinate;
  let coor2 = G.node.get(node2).coordinate;
  let dis = Math.sqrt((coor1[0] - coor2[0]) ** 2 + (coor1[1] - coor2[1]) ** 2);
  return dis;
}

function createGraph(nodeNumber, coordinate) {
  /* Create the inital graph with given input.
     input: number of nodes; coordinates of nodes
     output: graph */
  let G = new jsnx.Graph();
  for (let i = 0; i < nodeNumber; i++) {
    G.addNode(i, { coordinate: coordinate[i] });
    if (i !== 0) {
      G.addWeightedEdgesFrom([[i, i - 1, distance(G, i, i - 1)]]);
    }
    // G.addWeightedEdgesFrom([[0, nodeNumber - 1, distance(G, 0, nodeNumber - 1)]]);
  }
  return G;
}

function checkConnected(G) {
  /* Check if a graph is connected or not.
     input: graph
     output: true if the graph is connected and false if not. */
  let connected = true;
  for (let i = 0; i < G.nodes().length; i++) {
    connected = connected && jsnx.hasPath(G, { source: 0, target: i });
    if (connected === false) {
      break;
    }
  }
  return connected;
}

function checkBridge(G, node1, node2) {
  /* Check if an edge is a bridge or not.
     input: graph; two nodes
     output: true if the edge is an edge and false if not. */
  G.removeEdge(node1, node2);
  if (checkConnected(G)) {
    G.addWeightedEdgesFrom([[node1, node2, distance(G, node1, node2)]]);
    return false;
  }
  G.addWeightedEdgesFrom([[node1, node2, distance(G, node1, node2)]]);
  return true;
}

function qdeletion(G) {
  /* Calculate the q value for the addition of an edge.
     input: Graph
     output: q */
  let E = G.edges().length;
  let B = 0;
  for (let i = 0; i < E; i++) {
    if (checkBridge(G, G.edges()[i][0], G.edges()[i][1])) {
      B++;
    }
  }
  let output = 1 / (E - B);
  return output;
}

function checkEdge(G, node1, node2) {
  /* This function check if there is an edge between two given edges.
     input: Graph; two nodes
     output: true if there is an edge and false if not. */
  for (let i = 0; i < G.edges().length; i++) {
    if (
      (node1 === G.edges()[i][0] && node2 === G.edges()[i][1]) ||
      (node2 === G.edges()[i][0] && node1 === G.edges()[i][1])
    ) {
      return true;
    }
    return false;
  }
}

function qaddition(G) {
  /* Calculate  the q value for deletion of an edge. 
     input: Graph
     output: q */
  let E = G.edges().length;
  let M = 0;
  for (let j = 0; j < G.nodes().length - 1; j++) {
    for (let k = j + 1; k < G.nodes().length; k++) {
      if (!checkEdge(G, j, k)) {
        M++;
      }
    }
  }
  let output = 1 / ((M * (M - 1)) / 2 - E);
  return output;
}

function toBeOrNotToBe(G) {
  /* This function decide whether to add or delete an edge.
     input: Graph
     output: true if to add an edge and false to delete and edge */
  let add = 1 / qaddition(G);
  let del = 1 / qdeletion(G);
  let handOfFate = Math.random();
  if (add / (add + del) > handOfFate) {
    return true;
  }
  return false;
}

function addRandomEdge(G) {
  /* This function adds a random edge to a graph.
     input: Graph
     output: Graph with additional edge. */
  let node1 = Math.floor((G.nodes().length - 1) * Math.random());
  let node2 = Math.floor((G.nodes().length - 1) * Math.random());
  while (node1 === node2 || checkEdge(G, node1, node2)) {
    node1 = Math.floor((G.nodes().length - 1) * Math.random());
    node2 = Math.floor((G.nodes().length - 1) * Math.random());
  }
  G.addWeightedEdgesFrom([[node1, node2, distance(G, node1, node2)]]);
  return G;
}

function removeRandomEdge(G) {
  /* This function remove a random edge from a graph.
     input: Graph
     output: Graph with a random edge removed. */
  let candidate = [];
  for (let i = 0; i < G.edges().length; i++) {
    if (!checkBridge(G, G.edges()[i][0], G.edges()[i][1])) {
      candidate.push(G.edges()[i]);
    }
  }
  let unluckyKid = candidate[Math.floor(Math.random() * (candidate.length - 1))];

  G.removeEdge(unluckyKid[0], unluckyKid[1]);
  return G;
}

function theta(G, r, sourceNode) {
  /* This function calculate the theta parameter.
     input: Graph; r; Source Node
     output: theta */
  let sum1 = 0;
  for (let i = 0; i < G.edges().length; i++) {
    sum1 += G.adj.get(G.edges()[i][0]).get(G.edges()[i][1]).weight;
  }
  let sum2 = 0;
  for (let TargetNode = 0; TargetNode < G.nodes().length; TargetNode++) {
    sum2 += jsnx.dijkstraPathLength(G, { source: sourceNode, target: TargetNode });
  }
  let theta = sum1 * r + sum2;
  return theta;
}

function piRatio(Xi, Xj, r, T, sourceNode) {
  /* This function calculates the pi ratio between current and proposed state.
     input: graph of current state, graph of proposed state; parameters r & T; chosen source node
     output: pij/pii */
  let thetai = theta(Xi, r, sourceNode);
  let thetaj = theta(Xj, r, sourceNode);
  let pjpi = Math.exp((thetai - thetaj) / T);
  return pjpi;
}

function q(Xi, Xj) {
  /* This function decides whether to us qaddtion or qdeletion.
     input: graph of current state, graph of proposed state.
     output: q */
  if (Xi.edges().length > Xj.edges().length) {
    return qdeletion(Xi);
  }
  return qaddition(Xi);
}

function acceptance(Xi, Xj, r, T, sourceNode) {
  let a = Math.min(1, (piRatio(Xi, Xj, r, T, sourceNode) * q(Xi, Xj)) / q(Xj, Xi));
  return a;
}

function expectedValue(log) {
  /* This function calculates the expected value.
     input: an array 
     output: expected number */
  let sum = 0;
  for (let i = 0; i < log.length; i++) {
    sum += log[i];
  }
  let epv = sum / log.length;
  return epv;
}

function edgeConnectedToSource(G, sourceNode) {
  /* This function calculates the number of edges connected to the source node.
     input: graph; source node
     output: number of edges */
  let e = 0;
  for (let i = 0; i < G.edges().length; i++) {
    if (G.edges()[i][0] === sourceNode || G.edges()[i][1] === sourceNode) {
      e++;
    }
  }
  return e;
}

function maxDistance(G, sourceNode) {
  /* This function find the maximum distance from the source node in a graph.
     input: graph; source node
     output: maximum distance */
  let maxDis = 0;
  for (let i = 0; i < G.nodes().length; i++) {
    if (jsnx.dijkstraPathLength(G, { source: sourceNode, target: i }) > maxDis) {
      maxDis = jsnx.dijkstraPathLength(G, { source: sourceNode, target: i });
    }
  }
  console.log(maxDis);
  return maxDis;
}

function transitionGraph(G) {
  /* This function create a new graph that is identical to itself
     input: graph
     output: graph */
  let g = new jsnx.Graph();
  for (let i = 0; i < G.nodes().length; i++) {
    g.addNode(i, { coordinate: G.node.get(i).coordinate });
  }
  for (var j = 0; j < G.edges().length; j++) {
    g.addWeightedEdgesFrom([
      [G.edges()[j][0], G.edges()[j][1], distance(G, G.edges()[j][0], G.edges()[j][1])]
    ]);
  }
  return g;
}

function mcmc(data) {
  /* This function run the MCMC iteration.
     input: user input
     output:  */
  let coordinates = JSON.parse('[' + data.Coordinate + ']');
  let coorArray = [];
  for (let i = 0; i < data.Number; i++) {
    coorArray.push([coordinates[i * 2], coordinates[i * 2 + 1]]);
  }
  let Xi = createGraph(data.Number, coorArray);
  let Xtransition;
  let Xj;
  let numOfEdges = [];
  let numOfEdgesToSource = [];
  let maximumDis = [];
  for (let i = 0; i < data.Iterations - 1; i++) {
    if (toBeOrNotToBe(Xi)) {
      Xtransition = transitionGraph(Xi);
      Xj = addRandomEdge(Xi);
      Xi = transitionGraph(Xtransition);
    } else {
      Xtransition = transitionGraph(Xi);
      Xj = removeRandomEdge(Xi);
      Xi = transitionGraph(Xtransition);
    }
    let dice = Math.random();
    if (acceptance(Xi, Xj, data.r, data.T, data.SourceNode) > dice) {
      numOfEdges.push(Xj.edges().length);
      numOfEdgesToSource.push(edgeConnectedToSource(Xj, data.SourceNode));
      maximumDis.push(maxDistance(Xj, data.SourceNode));
      Xi = transitionGraph(Xj);
    }
  }
  console.log(
    `The expected number of edges in the graph is ${expectedValue(numOfEdges)}.`
  );
  console.log(
    `The expected number of edges connected to source node is ${expectedValue(
      numOfEdgesToSource
    )}.`
  );
  console.log(
    `The expected maximum distance of shortest path that connects to source node is ${expectedValue(
      numOfEdges
    )}.`
  );
}

if (require.main === module) {
  const userInputOptions = [
    // Define user input.
    { name: 'Number', alias: 'n', type: Number },
    {
      name: 'Coordinate',
      type: Array
    },
    { name: 'SourceNode', alias: 's', type: Number },
    { name: 'Iterations', alias: 'i', type: Number },
    { name: 'r', type: Number },
    { name: 'T', type: Number }
  ];
  const userInput = cla(userInputOptions);
  mcmc(userInput);
}

module.exports = {
  distance,
  theta,
  piRatio,
  createGraph,
  checkConnected,
  checkBridge,
  checkEdge,
  qaddition,
  qdeletion,
  toBeOrNotToBe,
  addRandomEdge,
  removeRandomEdge,
  q,
  acceptance,
  expectedValue,
  edgeConnectedToSource,
  maxDistance,
  transitionGraph,
  mcmc
};
