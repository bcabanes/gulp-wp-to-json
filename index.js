'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var config = require('./config.json');
var promise = require('bluebird');
var request = require('request-promise');

/**
 * Testing the flow:
 * - Grab some configurations;
 * - First call is WordPress API OPTIONS;
 * - Loop through all pages.
 */
function wpService(url, language) {
  /* jshint validthis: true */
  this.url = url;
  this.language = language;
  this.pagesIndex = [];
  this.pages = {};
}

wpService.prototype.requestUrl = function(param) {
  var options = {
    uri: [this.url, this.language, 'wp-json', param].join('/'),
    headers: {
        'User-Agent': 'gulp-wp-to-json',
        'Accept-Language': this.language
    },
    json: true // Automatically parses the JSON string in the response
  };
  return request(options);
};

wpService.prototype.setPage = function(name, id) {
  var self = this;
  console.log(chalk.blue('Set data for: '+name));
  return this.requestUrl('posts/'.concat(id))
    .then(function(data) {
      self.pages[name] = data;
    });
};

wpService.prototype.getPagesIndex = function() {
  console.log(chalk.blue('Construct page index...'));
  return this.requestUrl('option')
    .then(function(pages) {
      var index = [];
      for (var page in pages) {
        if (pages.hasOwnProperty(page) && pages[page].hasOwnProperty('ID')) {
          index.push({
            id : pages[page]['ID'],
            name: page
          });
        }
      }
      return index;
    });
};

wpService.prototype.populatePages = function() {
  var self = this;
  return this.pagesIndex.reduce(function(promise, page, index) {
      return promise.then(function() {
        return Promise.resolve(self.setPage(page.name, page.id));
      });
    }, Promise.resolve());
};

// ---
var wp = new wpService(config.url, 'en');
wp.getPagesIndex()
  .then(function(pagesIndex) {
    wp.pagesIndex = pagesIndex;
    return wp.populatePages();
  })
  .then(function() {
console.log(wp.pages);
  });
  // .then(wp.export);
