/* eslint-disable no-console */

const fs = require('fs');
const _ = require('lodash');

// Path of the root directory
const ROOT_PATH = 'src';

// Global variables
const lessList = [];
const classMap = {};

// Collect all .less file paths
const getAllLess = dir => {
  const items = fs.readdirSync(dir);
  _.forEach(items, item => {
    const path = dir + '/' + item;
    const state = fs.lstatSync(path);
    if (state.isDirectory()) {
      getAllLess(path);
    } else if (state.isFile() && path.split('.').pop() === 'less') {
      lessList.push(path);
    }
  });
};

// Count the number of files each className is defined in
const countAllClasses = () => {
  _.forEach(lessList, lessFile => {
    const data = fs.readFileSync(lessFile, 'utf-8');
    const lines = data.split('\n');
    const classSet = new Set();
    _.forEach(lines, line => {
      if (_.first(line) === '.') {
        const className = line.split(' ')[0];
        classSet.add(className);
      }
    });
    classSet.forEach(className => {
      if (!classMap[className]) {
        classMap[className] = [];
      }
      classMap[className].push(lessFile);
    });
  });
};

// Check when a className is defined in multiple .less files
const check = () => {
  getAllLess(ROOT_PATH);
  countAllClasses();
  let hasConflict = false;
  _.forEach(classMap, (fileList, className) => {
    const count = fileList.length;
    if (count > 1) {
      hasConflict = true;
      console.log(`${className} is defined in the following ${count} files:`);
      _.forEach(fileList, fileName => console.log('\t', fileName));
    }
  });
  if (hasConflict) {
    process.exit(1);
  }
};

check();
