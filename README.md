# mcmc [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> 

## Introduction

This program make use of Markov Chain Monte Carlo to estimate graphs that arised in a centralized distribution network.

User need to specify the number of nodes, coordinate of nodes, source node, r, t and desired iterations for the program. The default situation is:

- Number 5
- Coordinante 0,0,1,0,0,1,-1,0,0,-1
- Iteration 500
- r 1
- T 0
- SourceNode 0

The initial graph is generated with each node other than 0 being connected to it's previous node.

## Installation

```sh
$ git clone https://github.com/JinyuXu/mcmc.git
$ npm install --save mcmc
```

## Usage

```js
node lib/index.js --Number <# of nodes> --Coordinate <x1,y1,x2,y2...xn,yn> --Iteration <# of iteration> --r <value of r> --T <value of T> --SourceNode <source node>
```
## License

MIT © [Jinyu Xu]()


[npm-image]: https://badge.fury.io/js/mcmc.svg
[npm-url]: https://npmjs.org/package/mcmc
[travis-image]: https://travis-ci.org/JinyuXu/mcmc.svg?branch=master
[travis-url]: https://travis-ci.org/JinyuXu/mcmc
[daviddm-image]: https://david-dm.org/JinyuXu/mcmc.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/JinyuXu/mcmc
[coveralls-image]: https://coveralls.io/repos/JinyuXu/mcmc/badge.svg
[coveralls-url]: https://coveralls.io/r/JinyuXu/mcmc
