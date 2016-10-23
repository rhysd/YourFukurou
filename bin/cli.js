#! /usr/bin/env node
'use strict';

var spawn = require('child_process').spawn;
var electron = require('electron');
var join = require('path').join;

var argv = process.argv;
argv.unshift(join(__dirname, '..'));

spawn(electron, argv, { stdio: 'inherit' });
