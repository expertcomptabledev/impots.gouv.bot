import { login } from './login';
import { TIMEOUT } from './const';
declare var document;
import { log, logError, logSuccess, logPending, logJSON, logWarn } from '../helpers/logger';

export const selectCompany = async (email: string, password: string, siren: string) => {

  const url = `https://cfspro.impots.gouv.fr/mire/afficherChoisirDossier.do?idth=dossier12&action=choixDossier`;

  const { browser, page } = await login(email, password, false);

  await page.goto(url, {
    timeout: TIMEOUT,
  });

  // fill form
  await Promise.all([
      page.type('#siren0', siren.substring(0,1)),
      page.type('#siren1', siren.substring(1,2)),
      page.type('#siren2', siren.substring(2,3)),
      page.type('#siren3', siren.substring(3,4)),
      page.type('#siren4', siren.substring(4,5)),
      page.type('#siren5', siren.substring(5,6)),
      page.type('#siren6', siren.substring(6,7)),
      page.type('#siren7', siren.substring(7,8)),
      page.type('#siren8', siren.substring(8,9)),
  ])

  // send
  const [response] = await Promise.all([
    page.waitForNavigation({
      timeout: TIMEOUT,
    }),
    page.$eval('#ins_contenu > table > tbody > tr:nth-child(2) > td > form', form => form.submit()),
  ]);

  // ok return 
  return { browser, page };
  
};
