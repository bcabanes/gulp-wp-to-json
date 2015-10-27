'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var promise = require('bluebird');
var request = require('request-promise');

/**
 * Perform calls and retrieve WP data.
 * @param  {String} url    Url to perform requests.
 * @param  {String} locale Localisation of the file/request.
 */
function wpService(url, locale) {
  /* jshint validthis: true */
  this.url = url;
  this.contentFile = {};
  this.locale = locale || 'en-US';
  this.pagesIndex = [];
  this.pages = {};
  this.wpIndex = {};
}

wpService.prototype.getContentFile = function() {
  this.notify('Creation of content file...', 'yellow');
  // Make a copy of the wpIndex content.
  _.extend(this.contentFile, this.wpIndex);

  for (var page in this.pages) {
    if (this.pages.hasOwnProperty(page)) {
      this.contentFile[page] = this.pages[page];
    }
  }
  return this.contentFile;
};

wpService.prototype.getPagesIndex = function() {
  this.notify('Construct page index...', 'yellow');
  return this.getWpIndex()
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

wpService.prototype.getWpIndex = function() {
  var self = this;
  return this.requestUrl('option')
    .then(function(wpIndex) {
      self.wpIndex = wpIndex;
      return wpIndex;
    });
};

wpService.prototype.notify = function(message, color) {
  message = '[' + this.locale + '] ' + message;
  if (!color) {
    return console.log(chalk.grey(message));
  }
  return console.log(chalk[color].call(this, message));
};

wpService.prototype.populatePages = function() {
  var self = this;
  return this.pagesIndex.reduce(function(promise, page, index) {
      return promise.then(function() {
        return Promise.resolve(self.setPage(page.name, page.id));
      });
    }, Promise.resolve());
};

wpService.prototype.requestUrl = function(param) {
  var options = {
    uri: [this.url, param].join('/'),
    headers: {
        'User-Agent': 'gulp-wp-to-json',
        'Accept-Language': this.locale
    },
    json: true // Automatically parses the JSON string in the response
  };
  return request(options);
};

wpService.prototype.setPage = function(name, id) {
  var self = this;
  this.notify('Set data for: ' + name);
  return this.requestUrl('posts/'.concat(id))
    .then(function(data) {
      self.pages[name] = data;
    });
};

module.exports = wpService;
