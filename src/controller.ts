#!/usr/bin/env node

import simplegit from 'simple-git/promise';
import { ListLogSummary } from 'simple-git/typings/response';
import recursive from "recursive-readdir";
var clui = require('clui'), clc = require('cli-color'), Line = clui.Line;

export function getStatsPerAuthor(filePath: string, callback: Function) {
    let authorStatList: Array<AuthorStat> = new Array;
    const git = simplegit(filePath);
    //logs last 1000 commit statistics
    git.log(['--shortstat', '--no-merges', '-n1000'])
        .then(
            res => {
                //iterating over each commit
                for (let log of res.all) {
                    if (log.diff !== undefined) {
                        //if an authorStat class was created for the commit author, than its added, otherwise create new authorStat 
                        if (Array.from(authorStatList, x => x.AuthorName).every(x => log.author_name != x)) {
                            authorStatList.push(new AuthorStat(log.author_name, log.diff.deletions, log.diff.insertions));
                        } else {
                            let objIndex = authorStatList.findIndex(s => s.AuthorName == log.author_name);
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

export function getStatsPerFile(path: string, callback: Function) {
    const git = simplegit(path);
    let fileStatList: Array<FileStat> = new Array;
    recursive(path, async function (err: any, files: Array<string>) {
        //iterates over all files and folders in the repository path
        for (let filePath of files) {
            //logs last 1000 commit statistics for specific author
            await (git.log(['--shortstat', '--no-merges', '-n1000', filePath]))
                .then((res) => {
                    fileStatList.push(new FileStat(filePath, getSumInsertion(res), getSumDeletion(res)));
                })
                .catch(err => console.log(err));
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
    fileName?: string;
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




export function printToConsole(statList: Array<any>) {
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