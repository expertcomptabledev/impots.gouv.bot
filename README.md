# impots.gouv.bot

**Impots.gouv.bot** is a tool to crawl http://www.impots.gouv.fr pro account, and get all informations available with `cli` or with `node module`.

## Requirements

To use impots.gouv.bot, you must install :

* [node.js](https://nodejs.org/en/) >= 9.X

## Get started

1. Install cli using npm

```
npm install -g @expertcomptabledev/impots.gouv.bot
```

2. Try login command

```
➜  ~ impots login --email <your-email> --password <your-password>
@expertcomptabledev/impots.gouv.bot ✔  success   Logged in your impot.gouv.fr account
```

## How to

### Use CLI commands

All commands must use `impots` prefix, ex. `➜  ~ impots login ...`

You can ask help everywhere using `--help` flag.

* `login` : test login into your account (OK)
* `companies` : get list of your companies (OK)
* `declarations` : get declarations by type (in progress)

### Use lib in node project

1. Install impots.gouv.bot into your project using 

```
npm install @expertcomptabledev/impots.gouv.bot --save
```

2. Import impots.gouv.bot into your code

```
import impots from '@expertcomptabledev/impots.gouv.bot';
```

3. Use it !

```
const companies = await impots.companies(email, password);
console.log(companies);
```

Must print in your console a table with your companie list. Below an example of list formatted into table using `prettyjson` :

```
  ┌───────┬───────────┬──────────────────────────────┐
  │   #   │   SIREN   │             Name             │
  ├───────┼───────────┼──────────────────────────────┤
  │   1   │ XXX1X6X9X │ SAS XLA AXSUXXNXES           │
  ├───────┼───────────┼──────────────────────────────┤
  │   2   │ XX9X614X5 │ SAS XXXEXCAP XXXXNCE         │
  ├───────┼───────────┼──────────────────────────────┤
  ...
```
