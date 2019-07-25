#!/usr/bin/env node

import chalk from 'chalk';
const clear = require('clear');
import figlet from 'figlet';
import program from 'commander';
import simplegit from 'simple-git/promise';
import fs from "fs";
import { getStatsPerFile, printToConsole, getStatsPerAuthor } from "./controller"

var clui = require('clui');

runProgram()

async function runProgram() {

  //CLI header
  clear();
  console.log(
    chalk.red(
      figlet.textSync('churn calculator', { horizontalLayout: 'full' })
    )
  );

  //CLI input options
  program
    .version('0.0.1')
    .description("CLI app for git churn calculation")
    .option('-f, --perFile [repositoryPath]', 'top 10 files that have the highest churn within the given repository.')
    .option('-u, --perAuthor [repositoryPath]', 'the top 10 contributors with the highest churn in the repository.')
    .parse(process.argv);
  if (program.perFile) {
    // checks if the path given is a git repository
    if ((fs.existsSync(program.perFile)) && (await (simplegit(program.perFile).checkIsRepo()))) {
      getStatsPerFile(program.perFile, printToConsole)
    } else {
      console.log("Path doesn't exists or not a git repository");
    }
  }
  else if (program.perAuthor) {
    if ((fs.existsSync(program.perAuthor)) && (await (simplegit(program.perAuthor).checkIsRepo()))) {
      getStatsPerAuthor(program.perAuthor, printToConsole)
    } else {
      console.log("Path doesn't exists or not a git repository");
    }
  } else if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}




