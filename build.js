var async = require('async'),
    collections = require('metalsmith-collections'),
    markdown = require('metalsmith-markdown-remarkable'),
    Metalsmith = require('metalsmith'),
    permalinks  = require('metalsmith-permalinks'),
    templates = require('metalsmith-templates');

/**
 * Build.
 */

Metalsmith(__dirname)
    .source('./contents')
    .use(collections({
      pages: {
        pattern: './contents/**/*.md'
      }
    }))
    .use(markdown('full'), {
      breaks: true,
      typographer: true
    })
    .use(permalinks({
      pattern: ':title'
    }))
    .use(templates({
      'engine': 'jade',
      'directory': './theme/jade'
    }))
    .destination('./build')
    .build(function(err) {
      if (err) throw err;
    });
