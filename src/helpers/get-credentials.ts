const inquirer = require('inquirer');

export const getCredentials = async options => {
  options.email =
    options.email || process.env.IMPOTS_EMAIL ||
    (await inquirer
      .prompt([
        {
          name: 'email',
          message: 'Enter your email',
        },
      ])
      .then(res => res.email));
  options.password =
    options.password || process.env.IMPOTS_PASSWORD ||
    (await inquirer
      .prompt([
        {
          name: 'password',
          type: 'password',
          message: 'Enter your password',
        },
      ])
      .then(res => res.password));
  return options;
};
