#!/usr/bin/env node

const generate = require('./generate');

const [,, ...args] = process.argv;

const isGenerate = args.includes('generate');
// TODO: const isPreview = argsArr.includes('preview');

isGenerate && generate();

