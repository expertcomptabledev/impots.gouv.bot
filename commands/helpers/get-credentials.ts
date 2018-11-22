const inquirer = require('inquirer');
export const getCredentials = async (options) => {
    options.email = options.email || await inquirer.prompt([{
        name: 'email',
        message: 'Enter your email'
    }]).then(res => res.email);
    options.password = options.password || await inquirer.prompt([{
        name: 'password',
        type: 'password',
        message: 'Enter your password'
    }]).then(res => res.password);
    return options;
}