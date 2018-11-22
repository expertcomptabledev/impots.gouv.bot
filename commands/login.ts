import { logJSON, logError, log, logSuccess } from './helpers';
import * as actions from './actions';
const inquirer = require('inquirer');

export const login = (program: any) => {

    program
        .command('login')
        .option('-e, --email <your-email>', 'Email used to create your impots.gouv.fr account')
        .option('-p, --password <your-password>' , 'Password')
        .description('Login to impots.gouv.fr')
        .action(async (options) => {

            try {

                options.email = options.email || await inquirer.prompt([{
                    name: 'email',
                    message: 'Enter your email'
                }]).then(res => res.password);

                options.password = options.password || await inquirer.prompt([{
                    name: 'password',
                    type: 'password',
                    message: 'Enter your password'
                }]).then(res => res.password);

                await actions.login(options.email, options.password);
                logSuccess('Logged in your impot.gouv.fr account');

            } catch (error) {
                logError('something was wrong during login to impots.gouv.fr : ' + error.message);
            }

        });

}

