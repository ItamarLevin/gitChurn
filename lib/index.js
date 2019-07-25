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
var fs_1 = __importDefault(require("fs"));
var controller_1 = require("./controller");
var clui = require('clui');
runProgram();
function runProgram() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    //CLI header
                    clear();
                    console.log(chalk_1.default.red(figlet_1.default.textSync('churn calculator', { horizontalLayout: 'full' })));
                    //CLI input options
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
                    _a = (_c.sent());
                    _c.label = 2;
                case 2:
                    // checks if the path given is a git repository
                    if (_a) {
                        controller_1.getStatsPerFile(commander_1.default.perFile, controller_1.printToConsole);
                    }
                    else {
                        console.log("Path doesn't exists or not a git repository");
                    }
                    return [3 /*break*/, 7];
                case 3:
                    if (!commander_1.default.perAuthor) return [3 /*break*/, 6];
                    _b = (fs_1.default.existsSync(commander_1.default.perAuthor));
                    if (!_b) return [3 /*break*/, 5];
                    return [4 /*yield*/, (promise_1.default(commander_1.default.perAuthor).checkIsRepo())];
                case 4:
                    _b = (_c.sent());
                    _c.label = 5;
                case 5:
                    if (_b) {
                        controller_1.getStatsPerAuthor(commander_1.default.perAuthor, controller_1.printToConsole);
                    }
                    else {
                        console.log("Path doesn't exists or not a git repository");
                    }
                    return [3 /*break*/, 7];
                case 6:
                    if (!process.argv.slice(2).length) {
                        commander_1.default.outputHelp();
                    }
                    _c.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    });
}
