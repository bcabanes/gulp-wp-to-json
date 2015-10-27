# node-wp-to-json
Simple nodeJS script to transform you WordPress API into a single JSON file.

## Installation
```bash
npm install --save wp-to-json
```

### Usage
`wpToJson` is a simple WordPress api caller to save data in JSON file. It will basically call the `/option` route to know all pages that should be retrieved. Then, it will performs a call on each post to gather data.

```js
var wpToJson = require('wp-to-json');
```

You can now configure it by passing an array of objects like this:
```js
wpToJson([
  {
    'url': 'https://yourwordpressurl.com/wp-json',
    'locale': 'en',
    'dest': './build/whatever'
  },
  {
    'url': 'https://yourwordpressurl.com/subfolder/wp-json',
    'locale': 'fr'
    // The `dest` property is missing, default to ./dest/{{locale}}.json.
  }
]);
```

You can also use the script in a Gulp task:
```js
(function() {
  'use strict';

  var gulp = require('gulp');
  var wpToJson = require('wp-to-json');

  function extractWP() {
    return wpToJson([
        {
          'url': 'https://yourwordpressurl.com/wp-json',
          'locale': 'en',
          'dest': './build/whatever'
        },
        {
          'url': 'https://yourwordpressurl.com/subfolder/wp-json',
          'locale': 'fr'
          // The `dest` property is missing, default to ./dest/{{locale}}.json.
        }
      ]);
  }

  gulp.task('default', extractWP);
})();
```
