#!/usr/bin/env node

import chalk from 'chalk';
const clear = require('clear');
import figlet from 'figlet';
import program from 'commander';
import simplegit from 'simple-git/promise';
import { ListLogSummary } from 'simple-git/typings/response';
const recursive = require("recursive-readdir");
import fs from "fs";
var clui = require('clui'),
  clc = require('cli-color'),
  Line = clui.Line;

runProgram()

async function runProgram() {
  clear();
  console.log(
    chalk.red(
      figlet.textSync('churn calculator', { horizontalLayout: 'full' })
    )
  );

  program
    .version('0.0.1')
    .description("CLI app for git churn calculation")
    .option('-f, --perFile [repositoryPath]', 'top 10 files that have the highest churn within the given repository.')
    .option('-u, --perAuthor [repositoryPath]', 'the top 10 contributors with the highest churn in the repository.')
    .parse(process.argv);
  if (program.perFile) {
    const git = simplegit(program.perFile)
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


function getStatsPerAuthor(filePath: string, callback: Function) {
  let authorStatList: Array<AuthorStat> = new Array;
  const git = simplegit(filePath);
  git.log(['--shortstat', '--no-merges', '-n1000'])
    .then(
      res => {
        for (let log of res.all) {
          if (log.diff !== undefined) {
            if (Array.from(authorStatList, x => x.AuthorName).every(x => log.author_name != x)) {
              authorStatList.push(new AuthorStat(log.author_name, log.diff.deletions, log.diff.insertions));
            } else {
              let objIndex = authorStatList.findIndex((s => s.AuthorName == log.author_name));
              authorStatList[objIndex].added += log.diff.insertions;
              authorStatList[objIndex].deleted += log.diff.deletions;
            }
          }
        }
        authorStatList.sort((logA, logB) => { return (logB.added + logB.deleted) - (logA.added + logA.deleted) });
        callback(authorStatList.slice(0, 10));
      }
    )
}

function getStatsPerFile(path: string, callback: Function) {
  const git = simplegit(path);
  let fileStatList: Array<FileStat> = new Array;
  recursive(path, async function (err: any, files: Array<string>) {
    for (let filePath of files) {
      await (git.log(['--shortstat', '--no-merges', '-n1000', filePath]))
        .then((res) => {
          fileStatList.push(new FileStat(filePath, getSumInsertion(res), getSumDeletion(res)));
        })
        .catch((err) => {
          console.log(err);
        })
    }
    fileStatList.sort(
      (logA, logB) => { return logB.churn - logA.churn }
    );
    callback(fileStatList.slice(0, 10));
  })
}

function getSumInsertion(logList: ListLogSummary) {
  let sumInsertion = 0;
  for (let log of logList.all) {
    if ((log != null) && (log.diff !== undefined)) {
      sumInsertion += log.diff.insertions;
    }
  }
  return sumInsertion;
}

function getSumDeletion(logList: ListLogSummary) {
  let sumDeletions = 0;
  for (let log of logList.all) {
    if ((log != null) && (log.diff !== undefined)) {
      sumDeletions += log.diff.deletions;
    }
  }
  return sumDeletions;
}

class FileStat {
  filePath: string;
  fileName: string | undefined;
  added: number;
  deleted: number;
  churn: number;

  constructor(filePath: string, added: number, deleted: number) {
    this.added = added;
    this.deleted = deleted;
    this.fileName = filePath.split("\\").pop();
    this.filePath = filePath;
    this.churn = added + deleted;
  }
}

class AuthorStat {
  AuthorName: string;
  added: number;
  deleted: number;

  constructor(AuthorName: string, added: number, deleted: number) {
    this.added = added;
    this.deleted = deleted;
    this.AuthorName = AuthorName;
  }
}




function printToConsole(statList: Array<any>) {
  if (statList[0] instanceof AuthorStat) {
    var headers = new Line()
      .padding(2)
      .column('Number', 20, [clc.cyan])
      .column('Author', 20, [clc.cyan])
      .column('Churn', 20, [clc.cyan])
      .column('Added', 20, [clc.cyan])
      .column('deleted', 20, [clc.cyan])
      .fill()
      .output();

    statList.forEach((stat, index) => {
      var line = new Line()
        .padding(2)
        .column((index + 1).toString(), 20)
        .column(stat.AuthorName, 20)
        .column((stat.added + stat.deleted).toString(), 20)
        .column(stat.added.toString(), 20)
        .column(stat.deleted.toString(), 20)
        .fill()
        .output()
    })
  } else {
    var headers = new Line()
      .padding(2)
      .column('Number', 20, [clc.cyan])
      .column('File', 20, [clc.cyan])
      .column('Churn', 20, [clc.cyan])
      .column('Added', 20, [clc.cyan])
      .column('deleted', 20, [clc.cyan])
      .fill()
      .output();

    statList.forEach((stat, index) => {
      var line = new Line()
        .padding(2)
        .column((index + 1).toString(), 20)
        .column(stat.fileName, 20)
        .column(stat.churn.toString(), 20)
        .column(stat.added.toString(), 20)
        .column(stat.deleted.toString(), 20)
        .fill()
        .output()
    })
  }

}

