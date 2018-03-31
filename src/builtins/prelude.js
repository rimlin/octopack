require = function(modules, entry) {
  const cache = {};

  function Module() {
    this.exports = {};
  }

  function newRequire(name) {
    if (!cache[name]) {
      if (!modules[name]) {
        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      function localRequire(x) {
        return newRequire(localRequire.resolve(x));
      }

      localRequire.resolve = function(x) {
        return modules[name][1][x] || x;
      };

      var module = cache[name] = new Module();
      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports
      );
    }

    return cache[name].exports;
  }

  newRequire(entry);
}
