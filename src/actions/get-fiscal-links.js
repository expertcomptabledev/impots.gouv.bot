'use strict';
var _this = this;
exports.__esModule = true;
var tslib_1 = require('tslib');
exports.getFiscalLinks = function(page) {
  return tslib_1.__awaiter(_this, void 0, void 0, function() {
    var links;
    return tslib_1.__generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          if (!!page) return [3 /*break*/, 1];
          throw new Error('Need fiscal page to extract links');
        case 1:
          return [
            4 /*yield*/,
            page.evaluate(function() {
              return Array.from(document.querySelectorAll('#racine a'))
                .map(function(node) {
                  return node.href;
                })
                .filter(function(item, pos, self) {
                  return self.indexOf(item) == pos;
                });
            }),
          ];
        case 2:
          links = _a.sent();
          return [2 /*return*/, links];
      }
    });
  });
};
