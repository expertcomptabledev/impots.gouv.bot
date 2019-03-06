import { getFiscalAccount } from './get-fiscal-account';
import { getFiscalLinks } from './get-fiscal-links';
import { log, logError, logSuccess, logPending, logJSON, logWarn } from '../helpers/logger';
import { TIMEOUT } from './const';
declare var document, fetch;
var PromisePool = require('es6-promise-pool');
const { mkdirSync, existsSync, writeFile } = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const CLI = require('clui');
const Spinner = CLI.Spinner;
var flat = require('array.prototype.flat');

const typesDeclaration = {
  tva: 'DeclarationsTVA',
};

export interface cfeParams {
  email: string;
  password: string;
  siren: string;
  save?: boolean;
  out?: string;
  year?: string;
  close?: boolean;
}

export const cfe = async (params: cfeParams) => {
  const status = new Spinner('Getting cfe declarations, please wait...');
  status.start();

  const clean = async (browser, page) => {
    await page.close();
    await browser.close();
  };

  const getLink = (links: Array<string>, _type: string) => {
    if (Array.isArray(links)) {
      return links.filter(l => l.indexOf(_type) > -1)[0] || null;
    } else {
      throw new Error('No links provided');
    }
  };

  const { browser, page } = await getFiscalAccount(params.email, params.password, params.siren, false);

  const url = `https://cfspro.impots.gouv.fr/webadelie/servlet/voirTableauAvisCFEEnsembleAdresses.html?&vue=usager&t=L&siren=${
    params.siren
  }`;

  // go to declarations page
  await page.goto(
    () => {
      // verifify "tableau des avis d'impotision CFE"
    },
    { timeout: TIMEOUT },
  );

  try {
    if (params.save === true) {
      //
    }

    status.stop();

    if (params.close === true) {
      await clean(browser, page);
      // return declarations;
    } else {
      return { browser, page };
    }
  } catch (error) {
    status.stop();
    await clean(browser, page);
    throw error;
  }
};
