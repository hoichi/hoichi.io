---
title: Day 5
date: 2016-08-12
category: '100'
slug: day_5
listed: false
---

Fuck that, it’s day five of my multi-named unnamed project, even if I’m still sick (at least I’ve seen some doctors) and skipped a lot of days.

Turn me on, turn me on, everything I do is wrong. Written some code binding `chokidar` to observables. I think I can live with how coupled it all is currently. What bothers me is my dependencies. I’m using `fs-jetpack` which depends on `Q`, so sure enough I’ve started to use it as well, since `fs-jetpack` methods return `Q` promises anyway, and I don’t really want more than one promise library in the same project.

But brother, is `Bluebird.resolve()` so much nicer than `Q.fcall()`. Makes you think whether you need `fs-jetpack` all that much. Yes, it has some nice features, but frankly I’ve came to it for the `mkdirp` functionality, and only then stayed for promises. And if those are not the promises I need, shouldn’t I just use `mkdirp` and `Bluebird.promisifyAll(fs)`?

And that’s probably more blogging than coding for today already.