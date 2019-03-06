'use strict';
exports.__esModule = true;
var pkg = require('../../package.json');
var signale = require('signale');
exports.logError = function() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  signale.error({
    prefix: pkg.name,
    message: args,
  });
};
exports.log = function() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  signale.log({
    prefix: pkg.name,
    message: args,
  });
};
exports.logJSON = function(args, message) {
  var prettyjson = require('prettyjson');
  var options = {
    keysColor: 'yellow',
    dashColor: 'magenta',
  };
  signale.info({
    prefix: pkg.name,
    message: (message || '') + '\r\n' + prettyjson.render(args, options),
  });
};
exports.logSuccess = function() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  signale.success({
    prefix: pkg.name,
    message: args,
  });
};
exports.logWarn = function() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  signale.warn({
    prefix: pkg.name,
    message: args,
  });
};
exports.logPending = function() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  signale.pending({
    prefix: pkg.name,
    message: args,
  });
};
