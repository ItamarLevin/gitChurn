#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var clear = require('clear');
var figlet_1 = __importDefault(require("figlet"));
var commander_1 = __importDefault(require("commander"));
var promise_1 = __importDefault(require("simple-git/promise"));
var util = require('util');
var recursive = require("recursive-readdir");
var fs_1 = __importDefault(require("fs"));
var clui = require('clui'), clc = require('cli-color'), Line = clui.Line;
// const git = simplegit('C:/Users/User/exa');
function getStatsPerAuthor(filePath, callback) {
    var authorStatList = new Array;
    var git = promise_1.default(filePath);
    git.log(['--shortstat', '--no-merges', '-n1000'])
        .then(function (res) {
        var _loop_1 = function (log) {
            if (log.diff !== undefined) {
                if (Array.from(authorStatList, function (x) { return x.AuthorName; }).every(function (x) { return log.author_name != x; })) {
                    authorStatList.push(new AuthorStat(log.author_name, log.diff.deletions, log.diff.insertions));
                }
                else {
                    var objIndex = authorStatList.findIndex((function (s) { return s.AuthorName == log.author_name; }));
                    authorStatList[objIndex].added += log.diff.insertions;
                    authorStatList[objIndex].deleted += log.diff.deletions;
                }
            }
        };
        for (var _i = 0, _a = res.all; _i < _a.length; _i++) {
            var log = _a[_i];
            _loop_1(log);
        }
        // console.log(authorStatList[5]);
        authorStatList.sort(function (logA, logB) { return (logB.added + logB.deleted) - (logA.added + logA.deleted); });
        // console.log(authorStatList[5]);
        callback(authorStatList.slice(0, 10));
    });
}
function getStatsPerFile(path, callback) {
    var git = promise_1.default(path);
    var fileStatList = new Array;
    recursive(path, function (err, files) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_2, _i, files_1, filePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _loop_2 = function (filePath) {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (git.log(['--shortstat', '--no-merges', '-n1000', filePath]))
                                            .then(function (res) {
                                            fileStatList.push(new FileStat(filePath, getSumInsertion(res), getSumDeletion(res)));
                                        })
                                            .catch(function (err) {
                                            console.log(err);
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, files_1 = files;
                        _a.label = 1;
                    case 1:
                        if (!(_i < files_1.length)) return [3 /*break*/, 4];
                        filePath = files_1[_i];
                        return [5 /*yield**/, _loop_2(filePath)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        fileStatList.sort(function (logA, logB) { return logB.churn - logA.churn; });
                        callback(fileStatList.slice(0, 10));
                        return [2 /*return*/];
                }
            });
        });
    });
}
function getSumInsertion(logList) {
    var sumInsertion = 0;
    for (var _i = 0, _a = logList.all; _i < _a.length; _i++) {
        var log = _a[_i];
        if ((log != null) && (log.diff !== undefined)) {
            sumInsertion += log.diff.insertions;
        }
    }
    return sumInsertion;
}
function getSumDeletion(logList) {
    var sumDeletions = 0;
    for (var _i = 0, _a = logList.all; _i < _a.length; _i++) {
        var log = _a[_i];
        if ((log != null) && (log.diff !== undefined)) {
            sumDeletions += log.diff.deletions;
        }
    }
    return sumDeletions;
}
var FileStat = /** @class */ (function () {
    function FileStat(filePath, added, deleted) {
        this.added = added;
        this.deleted = deleted;
        this.fileName = filePath.split("\\").pop();
        this.filePath = filePath;
        this.churn = added + deleted;
    }
    return FileStat;
}());
var AuthorStat = /** @class */ (function () {
    function AuthorStat(AuthorName, added, deleted) {
        this.added = added;
        this.deleted = deleted;
        this.AuthorName = AuthorName;
    }
    return AuthorStat;
}());
function runProgram() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    clear();
                    console.log(chalk_1.default.red(figlet_1.default.textSync('churn calculator', { horizontalLayout: 'full' })));
                    commander_1.default
                        .version('0.0.1')
                        .description("CLI app for git churn calculation")
                        .option('-f, --perFile [repositoryPath]', 'top 10 files that have the highest churn within the given repository.')
                        .option('-u, --perAuthor [repositoryPath]', 'the top 10 contributors with the highest churn in the repository.')
                        .parse(process.argv);
                    if (!commander_1.default.perFile) return [3 /*break*/, 3];
                    _a = (fs_1.default.existsSync(commander_1.default.perFile));
                    if (!_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, (promise_1.default(commander_1.default.perFile).checkIsRepo())];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    if (_a) {
                        getStatsPerFile(commander_1.default.perFile, printToConsole);
                    }
                    else {
                        console.log("Path doesn't exists or not a git repository");
                    }
                    return [3 /*break*/, 4];
                case 3:
                    if (commander_1.default.perAuthor) {
                        getStatsPerAuthor(commander_1.default.perAuthor, printToConsole);
                    }
                    else if (!process.argv.slice(2).length) {
                        commander_1.default.outputHelp();
                    }
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function printToConsole(statList) {
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
        statList.forEach(function (stat, index) {
            var line = new Line()
                .padding(2)
                .column((index + 1).toString(), 20)
                .column(stat.AuthorName, 20)
                .column((stat.added + stat.deleted).toString(), 20)
                .column(stat.added.toString(), 20)
                .column(stat.deleted.toString(), 20)
                .fill()
                .output();
        });
    }
    else {
        var headers = new Line()
            .padding(2)
            .column('Number', 20, [clc.cyan])
            .column('File', 20, [clc.cyan])
            .column('Churn', 20, [clc.cyan])
            .column('Added', 20, [clc.cyan])
            .column('deleted', 20, [clc.cyan])
            .fill()
            .output();
        statList.forEach(function (stat, index) {
            var line = new Line()
                .padding(2)
                .column((index + 1).toString(), 20)
                .column(stat.fileName, 20)
                .column(stat.churn.toString(), 20)
                .column(stat.added.toString(), 20)
                .column(stat.deleted.toString(), 20)
                .fill()
                .output();
        });
    }
}
runProgram();
