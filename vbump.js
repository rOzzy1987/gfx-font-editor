'use strict';

import fs from 'fs';
import { spawn } from 'child_process';

var log = fs.createWriteStream('vbump.log');
var err = log;
var clog = console.log;
var cerr = console.error;
console.log = function (x, ...others) {
    clog(x);
    log.write(`${new Date().toISOString()} LOG: ${x}`);
    for (var o of others) {
        log.write(`     ${o}`);
    }
    log.write('\n');
};
console.error = function (x, ...others) {
    cerr(x, others);
    err.write(`${new Date().toISOString()} ERR: ${x}`);
    for (var o of others) {
        err.write(`     ${o}`);
    }
    err.write('\n');
};

function runCmd(cmd, args) {
    console.log('Running command: ' + cmd + ' ' + args.join(' ') + '\n');
    var prc = spawn(cmd, args);
    var out = '';
    return new Promise((res, rej) => {
        prc.stdout.on('data', (x) => {
            out += x.toString();
            console.log(x.toString());
        });
        prc.stderr.on('data', (x) => {
            console.error(x.toString());
        });
        prc.on('error', (e) => {
            console.error(e.toString());
            rej(e.toString());
        });
        prc.on('exit', (c) => {
            if (c > 0) {
                console.error(`Process exited with code ${c}\n`);
                rej(c);
            } else {
                console.log(`Process exited with code ${c}\n`);
                res(out);
            }
        });
    });
}

async function incrementVersion() {
    var rawdata = fs.readFileSync('package.json');
    var packJson = JSON.parse(rawdata);

    var match = /([0-9]+).([0-9]+).([0-9]+)/g.exec(packJson.version);
    var maj = match[1];
    var min = match[2];
    var rev = Number(match[3]);

    packJson.version = `${maj}.${min}.${++rev}`;

    fs.writeFileSync('package.json', JSON.stringify(packJson, null, 2));

    console.log('package.json updated, new version: ' + packJson.version);

    await runCmd('git', ['add', 'package.json']);
    var status = await runCmd('git', ['status', '-s']);
    var changes = status
        .split(/\n/)
        .map((l) => l.trimEnd())
        .filter((l) => l != '');

    if (changes.every((l) => l.charAt(0) != ' ')) {
        var msg = `version bump to ${packJson.version}`;

        await runCmd('git', ['commit', '-m', msg]);
        console.log('[Publish] committed');
        await runCmd('git', ['push']);
        console.log('[Publish] pushed');
    } else {
        console.log('[Publish] Unstaged changes present, skipping commit & push');
    }
}

incrementVersion();
