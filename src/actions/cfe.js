'use strict';
var _this = this;
exports.__esModule = true;
var tslib_1 = require('tslib');
var get_fiscal_account_1 = require('./get-fiscal-account');
var const_1 = require('./const');
var PromisePool = require('es6-promise-pool');
var _a = require('fs'),
  mkdirSync = _a.mkdirSync,
  existsSync = _a.existsSync,
  writeFile = _a.writeFile;
var join = require('path').join;
var promisify = require('util').promisify;
var CLI = require('clui');
var Spinner = CLI.Spinner;
var flat = require('array.prototype.flat');
var typesDeclaration = {
  tva: 'DeclarationsTVA',
};
exports.cfe = function(params) {
  return tslib_1.__awaiter(_this, void 0, void 0, function() {
    var status, clean, getLink, _a, browser, page, url, error_1;
    var _this = this;
    return tslib_1.__generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          status = new Spinner('Getting cfe declarations, please wait...');
          status.start();
          clean = function(browser, page) {
            return tslib_1.__awaiter(_this, void 0, void 0, function() {
              return tslib_1.__generator(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return [4 /*yield*/, page.close()];
                  case 1:
                    _a.sent();
                    return [4 /*yield*/, browser.close()];
                  case 2:
                    _a.sent();
                    return [2 /*return*/];
                }
              });
            });
          };
          getLink = function(links, _type) {
            if (Array.isArray(links)) {
              return (
                links.filter(function(l) {
                  return l.indexOf(_type) > -1;
                })[0] || null
              );
            } else {
              throw new Error('No links provided');
            }
          };
          return [
            4 /*yield*/,
            get_fiscal_account_1.getFiscalAccount(params.email, params.password, params.siren, false),
          ];
        case 1:
          (_a = _b.sent()), (browser = _a.browser), (page = _a.page);
          url =
            'https://cfspro.impots.gouv.fr/webadelie/servlet/voirTableauAvisCFEEnsembleAdresses.html?&vue=usager&t=L&siren=' +
            params.siren;
          // go to declarations page
          return [
            4 /*yield*/,
            page.goto(
              function() {
                // verifify "tableau des avis d'impotision CFE"
              },
              { timeout: const_1.TIMEOUT },
            ),
          ];
        case 2:
          // go to declarations page
          _b.sent();
          _b.label = 3;
        case 3:
          _b.trys.push([3, 7, , 9]);
          if (params.save === true) {
            //
          }
          status.stop();
          if (!(params.close === true)) return [3 /*break*/, 5];
          return [4 /*yield*/, clean(browser, page)];
        case 4:
          _b.sent();
          return [3 /*break*/, 6];
        case 5:
          return [2 /*return*/, { browser: browser, page: page }];
        case 6:
          return [3 /*break*/, 9];
        case 7:
          error_1 = _b.sent();
          status.stop();
          return [4 /*yield*/, clean(browser, page)];
        case 8:
          _b.sent();
          throw error_1;
        case 9:
          return [2 /*return*/];
      }
    });
  });
};
