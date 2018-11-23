# impots.gouv.bot

**Impots.gouv.bot** is a tool to crawl http://www.impots.gouv.fr pro and get all informations available with `cli` or with `node module`.

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

All command are to prefix with `impots`, ex. `➜  ~ impots login ...`

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