import es6 from './es6';

export default function (code, opts) {
  return es6(`module.exports = ${code};`, opts);
};
