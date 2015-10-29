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
  this.menusIndex = [];
  this.menus = {};
  this.options = {};
  this.pages = {};
  this.wpIndex = {};
}

wpService.prototype.getContentFile = function() {
  this.notify('Creation of content file...', 'yellow');
  // Make a copy of the wpIndex content.
  _.extend(this.contentFile, this.wpIndex);

  this.contentFile.pages = {};
  for (var page in this.pages) {
    delete this.contentFile[page];
  }
  this.contentFile.pages = this.pages;

  this.contentFile.menus = {};
  for (var menu in this.menus) {
    delete this.contentFile[menu];
  }
  this.contentFile.menus = this.menus;

  this.contentFile.options = {};
  this.options = this.extractOptions(this.contentFile);
  for (var option in this.options) {
    delete this.contentFile[option];
  }
  this.contentFile.options = this.options;

  return [this.contentFile];
};

wpService.prototype.getMenusIndex = function() {
  this.notify('Construct menus index...', 'yellow');
  return this.requestUrl('menus')
    .then(function(menus) {
      var index = [];
      for (var menu in menus) {
        if (menus.hasOwnProperty(menu) && menus[menu].hasOwnProperty('ID')) {
          index.push({
            id : menus[menu]['ID'],
            name: menus[menu]['slug']
          });
        }
      }
      return index;
    });
};

wpService.prototype.getPagesIndex = function() {
  this.notify('Construct pages index...', 'yellow');
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

wpService.prototype.populateMenus = function() {
  var self = this;
  return this.menusIndex.reduce(function(promise, menu, index) {
      return promise.then(function() {
        return Promise.resolve(self.setMenu(menu.name, menu.id));
      });
    }, Promise.resolve());
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

wpService.prototype.extractOptions = function(content) {
  var options = {};
  // Make a copy of the content before sanitizing.
  _.extend(options, content);
  delete options.pages;
  delete options.menus;

  return options;
};

wpService.prototype.setMenu = function(name, id) {
  var self = this;
  this.notify('Set data for: ' + name);
  return this.requestUrl('menus/'.concat(id))
    .then(function(data) {
      self.menus[name] = data;
    });
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
