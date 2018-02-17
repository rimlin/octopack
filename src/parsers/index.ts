import es6 from './es6';
import json from './json';

export const PARSERS = [
  { extnames: ['.js', '.jsx', '.es6'], parser: es6 },
  { extnames: ['.json'], parser: json },
];
