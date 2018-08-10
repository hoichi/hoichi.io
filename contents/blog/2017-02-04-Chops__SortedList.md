---
permalink: false
title: Sorting Lists, Testing Units
date: 2016-02-04
slug: sorting-lists-testing-units
excerpt: Here’s your brain on drugs.
tags: [ chops, all I build is this blog, csp]
---

Here’s ~~your brain on drugs~~ what the thick of the `Collector` class in [my little yet-to-be born static build engine](https://github.com/hoichi/chops) looked like just a few days ago:

```typescript
while ((event = yield take(chIn)) !== csp.CLOSED) {
    let {action} = event;

    if (action === 'flush') {
        l('About to flush ’em pages');
        // emit the pages. and don’t stop till we’ve sent ’em all
        yield* this.flushAllPages();
        yield* this.sendCollection();
        this._isFlushed = true;
        continue;
    }

    if (action === 'ready') {
        this._pagesExpected = event.count;
        this.flushIfAllPagesArrived();
        continue;
    }

    if (action === 'add') {
        this._pagesArrived++;
        this.flushIfAllPagesArrived();
    }

    if (~['add', 'change'].indexOf(action)) {
        l(`Collecting the page "${event.data && event.data.id}"`);
        page = event.data;
        if (!this._filter(page)) {
            yield put(chOutPg, event);  // let it go, it’s not yours
            continue;
        }

        page = this.addSorted(page);
        this.flushIfAllPagesArrived();

        if (this._isFlushed) { // green light, we can send it downstream
            // emit the current page
            yield put(chOutPg, {
                action: action,
                type: 'PAGE',
                data: page
            });
            yield* this.sendCollection();
        }
    }
}
```

Let’s not go into _all_ the scary details. What matters now is that the class had too much concerns: data flow, data conversion &c. And this is what the same cycle looks today:

```typescript
while ((event = yield take(chIn)) !== csp.CLOSED) {
    let {action, data: page} = event,
        pages: ChopEvent<any>[] = [];

    if (action === 'ready') {
        pages = this._list.sort()
                .map(pageToEvent('add'));
        pages.push({action: 'ready'});  // sending `ready` once
    } else if (~['add', 'change'].indexOf(action)) {
        l(`Collecting the page "${page && page.id}"`);
        if (!this._filter(page)) {
            yield put(chOutPg, event);  // let it go, it’s not yours
            continue;
        }

        pages = this._list.add(page)
                .map(pageToEvent(action));
    }

    if (pages.length) {
        yield* this.sendPages(pages);
        yield* this.sendCollection(this._list.all);
    }
}
```

Yes, I cheated a bit, cause I don’t count my pages anymore: I just sort, mutate and send them the moment the `ready` event has arrived. But otherwise, it’s about the same.

The concerns that I moved out of the `Collector` class and into the new `SortedList` class are:

- keeping a list of pages
- sorting that list
- optionally, setting linking a page to its neighbors (for those prev/next links)

What `SortedList` doesn’t care about is data flow. It just returns an array of pages (or any data, for that matter), that are updated as a result of an operation.

A little implementation detail: if the list is still unsorted, adding to it returns an empty array. The reason for this is that inserting into a sorted position is expensive, and setting previous/next values all the time is expensive too. So my engine waits until _Chokidar_ emits `ready`. Speed is not my most pressing issue at the moment, but there you have it.

Anyway, back to separation of concerns. As a result of its simplicity, `SortedList` is pretty easy to unit test. And indeed, this is the first module that I wrote some tests for. I chose Mocha/Chai for that. I’ve seen [some](https://github.com/ChiperSoft/tape-vs-mocha) rather [strong](https://medium.com/javascript-scene/why-i-use-tape-instead-of-mocha-so-should-you-6aa105d8eaf4#.7t1nyzcip) arguments for Tape as opposed to Mocha, and [the new magic asserts](https://github.com/avajs/ava/releases/tag/v0.18.0) in AVA look hot as hell, but the truth is Mocha is better supported by WebStorm so I decided to try it first. Maybe I’ll stick with it for this project.

Frameworks aside, color me converted. It wasn’t strict TDD: I’ve written the tests _after_ the code. But let me tell you, unit testing does work. I’m no Paul Allen, so the code I write is usually pretty buggy. I do catch most of the bugs eventually, but my usual process is rather painful. I forget what parts of my code do, I don’t even know which part is spitting in my soup, and I’m never sure how many more of those nasties are still hiding in there.

Enter the unit tests. Now you have a pretty good idea what your code is supposed to do, you know where to look so you don’t have to keep all of your code in your head, and chances are, with a good coverage you’ve squashed pretty much all of your bugs for good. Divide and conquer, beatch!

(But speaking of coverage, I’ve yet to try Istanbul or what have you.)

Back to the code above, I can’t say I’m happy with it yet. I still think I should separate data flow from data manipulation, and probably that’s exactly what I’ll do next.