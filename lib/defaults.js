module.exports = {};

var reOptional = module.exports.reOptional = /^(optional|\(\W*optional\W*\)$)/i;

var unitsOfMeasure = module.exports.unitsOfMeasure = {
  tablespoon: ['T', 'Tbs', 'tbs', 'tbsp', 'Tbsp'],
  teaspoon: ['t', 'Tsp', 'tsp'],
  cup: ['C', 'c'],
  pint: ['pt', 'PT', 'Pt'],
  quart: ['QT', 'Qt', 'qt'],
  pinch: [],
  little: [],
  dash: [],
  gallon: ['Gal', 'GAL', 'gal'],
  ounce: ['oz', 'Oz', 'OZ'],
  milliliter: ['ml', 'mL'],
  liter: ['L', 'l'],
  gram: ['g'],
  kilogram: ['kg'],
  inch: ['"', 'in', 'In', 'IN'],
  millimeter: ['mm'],
  centimeter: ['cm'],
  whole: [],
  half: [],
  can: [],
  bottle: [],
  large: ['lg', 'LG', 'Lg'],
  package: ['pkg', 'Pkg', 'PKG'],
  pound: ['lb', 'Lb', 'LB'],
  head: ['heads'],
  clove: ['cloves'],
  sprig: ['sprigs'],
  stalk: ['stalks'],
  small: [],
  medium: [],
  large: [],
  stick: ['sticks'],
  bunch: ['bunches'],
  bitesize: ['bite-size']
};

var prepWords = module.exports.prepWords = [
  'chopped', 'sliced', 'minced', 'grated', 'cold', 'dried', 'diced', 'halved', 'quartered', 'softened', 'melted', 'drained', 'rinsed', 'peeled', 'cored', 'loosely packed', 'packed', 'julienned', 'divided', 'thawed',
  'peeled', 'deveined', 'packed', 'loosely packed', 'firmly packed', 'shredded', 'fresh', 'ground', 'freshly', 'coarsely', 'cubed', 'crushed', 'unbleached', 'unpeeled', 'crumbled'
];

var fluidicWords = module.exports.fluidicWords = [
  'fluid', 'fl'
];

//var reToWords = module.exports.reToWords = / *((to)( +)|(to)([0-9]+)|-( *))/i;
var reToWords = module.exports.reToWords = / *(to([ 0-9]+)|- *)/i;

var noiseWords = module.exports.noiseWords = [
  'a', 'of', 'for serving'
];

var singularizeFixes = module.exports.singularizeFixes = [
  'cloves'
];