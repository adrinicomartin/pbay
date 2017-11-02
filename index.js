#! /usr/bin/env node
var program = require('commander')
    , pirata = require('./lib/pbay')
    , Spinner = require('cli-spinner').Spinner
    ;

// Get version from package.json.
var version = require('./package.json').version;
program.version(version)
program.name('pbay')

/**
* Search command.
* Example: pirata search [keywords].
*/
program
    .command('search [keywords]')
    .alias('s')
    .description('Use this command to search torrents.')
    .action(function (keywords, options) {
        if (!keywords) {
            console.log('Error: keywords missing');
            program.help();
        }
        console.log('');
        var spinner = new Spinner('%s searching : ' + keywords);
        spinner.setSpinnerString(6);
        spinner.start();
        pirata.search(keywords, function (torrents) {
            spinner.stop(true);
            pirata.displayTorrents(torrents);
        });
    });

program.parse(process.argv);

if (!program.args || !program.args.length) {
    program.help();
}
