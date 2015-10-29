'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var fs = require('fs-extra');
var promise = require('bluebird');


/**
 * Interns
 */
var wpService = require('./wpService');

function wpToJson(options) {

  /**
   * Check url parameter.
   */
  if (!_.isArray(options) || !options.length) {
    throw new Error(chalk.red('Param options should be an array of objects'));
  }

  /**
   * Tag assets with tags given in series.
   */
  return options.reduce(function(promise, params) {
      return promise.then(function() {
        var wp = new wpService(params.url, params.locale);
        return wp.getMenusIndex()
          .then(function(menusIndex) {
            wp.menusIndex = menusIndex;
            return wp.populateMenus();
          })
          .then(function() {
            return wp.getPagesIndex()
              .then(function(pagesIndex) {
                wp.pagesIndex = pagesIndex;
                return wp.populatePages();
              });
          })
          .then(function() {
            var dest = params.dest || './dest';
            dest = dest.concat('/', params.locale, '.json');
            fs.outputJson(dest, wp.getContentFile(), function(response) {
              if(response) {
                return console.log(chalk.red(response));
              }
              console.log(chalk.green('File created: '+dest));
            });
          });
      });
  }, Promise.resolve());
}

module.exports = wpToJson;
