#!/usr/bin/env node
import * as commands from './commands';
const pkg = require('../package.json');
const program = require('commander');
program.version(pkg.version);

// init login command
commands.login(program);
commands.companies(program);
commands.declarations(program);
commands.declareInformations(program);
commands.fiscalInformations(program);

program.parse(process.argv);