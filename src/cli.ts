#!/usr/bin/env node

import * as yargs from 'yargs';
import {run} from "./run";


const yarg = yargs.usage('Create .css.d.ts from CSS modules *.css files.\nUsage: $0 [options] <search directory>')
  .example('$0 src/styles', '')
  .example('$0 src -o dist', '')
  .example('$0 -p styles/**/*.icss -w', '')
  .detectLocale(false)
  .demand(['_'])
  .alias('p', 'pattern').describe('p', 'Glob pattern with css files').string("p")
  .alias('o', 'outDir').describe('o', 'Output directory').string("o")
  .alias('w', 'watch').describe('w', 'Watch input directory\'s css files or pattern').boolean('w')
  .alias('c', 'camelCase').describe('c', 'Convert CSS class tokens to camelcase').boolean("c")
  .alias('d', 'dropExtension').describe('d', 'Drop the input files extension').boolean('d')
  .alias('s', 'silent').describe('s', 'Silent output. Do not show "files written" messages').boolean('s')
  .alias('i', 'indent').describe('s', 'Specify the code indent of output content').string('i')
  .alias('h', 'help').help('h')
  .version(require('../package.json').version);


main();

async function main(): Promise<void> {
  const argv = yarg.argv;

  if(argv.h) {
    yarg.showHelp();
    return;
  }

  let searchDir: string;
  if(argv._ && argv._[0]) {
    searchDir = argv._[0];
  }else if(argv.p) {
    searchDir = './';
  }else{
    yarg.showHelp();
    return;
  }

  await run(searchDir, {
    pattern: argv.p,
    outDir: argv.o,
    indent: argv.i,
    watch: argv.w,
    camelCase: argv.c,
    dropExtension: argv.d,
    silent: argv.s,
  });
};
