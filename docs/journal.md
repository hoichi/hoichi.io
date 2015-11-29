# Journal #

## Sep 05 ’15 ##

Spent a few hours (not a lot of it straight) reading on streams and vinyl adapters and `through2`. Now I should probably start writing a task with a transform function before it all evaporates.

Then again, maybe I should outline my yaml config system first.


And then I suddenly remember that:

- I decided to try and use `gulp-markdown-it` after all
- ...

Ok, scratch that. I could use `gulp-markdown-it` to generate headerless/footerless html and then read it and include it in Jade, but I could as well _not_ write it to disk but render it and feed it

## Sep 06 ’15 ##

Ha. [Obviously](http://jekyllrb.com/docs/variables/), Jekyll gathers all the site data before proceeding with templates. Not sure if it does it lazily, if it cashes all that data somewhere, but _all_ the pages' metadata _and_ contents is available to them Liquid templates. 


Ok. Let's try precompiling all 'em Jade page layouts. I have to:
  
- figure out what to precompile
  _(prolly all the files in `theme/jade` that don't start with the underscore)_
- evaluate through files (`gulp.src()` or just plain `fs.something`?)
- use `compileFile` on every eligible files and collect that stuff
- should I return something to `pipe()`? Should I end the chain with something other than pipe?

Another ha. Turns out you have to know your globals when you compile a Jade template to a function. Not sure they should actually have values at compile (should I check it somehow), but if they should, that means I have to process all the markdown files _before_ compiling Jade. 

## Sep 07 �15 ##

Alright, where were we? Let's try and check whether your varibables should be all set at compile time.



Whelp. Figured it out. Jade just needs var names, because otherwise it converts all the var names to `locals_.varName`, `locals_` being an alias to the parameters passed.

Also, a top-level var in a gulp file is not global. You have to use `GLOBAL.varName`.

And is it such a hot idea, now that I think about it? Can't I just pass all the parameters as local? I mean, Jade uses friggin' `eval()` for global variables (how else would it get them values at runtime). Not to mention the globals themselves are kinda evil.


So. Something done, let's go to sleep.

## Sep 10 �15 ##

I wonder if I should make it with Gulp and streams after all. Push data to the `site` object, pull it from the `site` object, build pages when all the data for a page is available.

Might be tricky though. Pretty hard to tell when _all_ the data is available. Even with some libs like `lazy.js`.

Also, no gains for a lot of pain.

## Sep �14 ##

Added Babel support, by the by. Now I can use ES6 in the gulp script. But that was a few days ago.
Maybe I could actually have it all for free with the Node 4.0, but I'm not sure my dependencies are ready.
Might check them out in a bit though.

Now, whether or not I implement next/previous stuff right away, I still need to sort my post collection somehow.

## Sep �21 ##

Hi, remember me?

Fixed the jade compilation. At least it finishes without errors. Now to give thouse functions some real data.

## Sep �22 ##

What if I try using node 4.0?
Welp, of course, even npm-update breaks, so why bother. I'll probably wait at least till nvm-windows upgrages.

Abstracted that file checks into a function. Well, it works, but looks downright horrid:

```js
    g.src(['theme/jade/*.jade', '!_*.jade'])
        .pipe(
            through.obj( function tf_compileAJadeVinyl(file, enc, cb) {
                playTheVinyl(file,
                    (f, o) => {
                        let key = path.basename(file.path, '.jade'),
                            method  = jade.compile(file.contents.toString(), {
                                pretty: '\t',
                                filename: file.path
                            });

                        cfg.layouts[key] = method;
                    },
                    {encoding: enc}, cb
                );
            })
            .on( 'end', function tf_compileAJadeVinyl_end() {cb_t()} )
        );
```

So much nesting, so little task-specific logic.

Should I make a vinyl-specific version of `through2`? Should I monkey patch a stream with `.pipethrough_vf()` (probably not)?

## Sep �29 ##

Where was I? Ah, should I make a vinyl-specific version of `through2`? Or should I build a freaking blog to start with?

## Oct �2 ##

All those plans to build a mega-plugin like `through2` but with more boilerplate. All this trying to figure out what does all this code in `through2` even does. It all comes down to about this:

```js
    gulp.src( path.join(cfg.sources.contents, '**/*.@(md|mdown|markdown)'), {base: cfg.sources.contents})
        .on('data', file => {
            // ...
        })
        .on('end', cb);
```