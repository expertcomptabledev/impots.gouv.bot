#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var commands = require("./commands");
var pkg = require('./package.json');
var program = require('commander');
program.version(pkg.version);
// init login command
commands.login(program);
commands.companies(program);
program.parse(process.argv);
