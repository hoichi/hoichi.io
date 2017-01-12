---
title: Self-assessment v. 2017.1
slug: the-fuck-i-know
date: 2017-01-08
template: single
---
This self-assessment circa Jan ’17 is mostly based upon [Eric Elliott’s list](https://medium.com/javascript-scene/top-javascript-frameworks-topics-to-learn-in-2017-700a397b711#.19gg46ezb) and [Superhero.js](http://superherojs.com/). I should probably clean it up, add some sources, or maybe put them all elsewhere, but here’s a first draft.

## JavaScript & DOM Fundamentals

### JS Basics

- [x] **Builtin methods** (especially arrays, objects, strings, and numbers). 
    - _Well, I’m at least acquainted with what I’ve been using. Know almost nothing of numbers, but then saw no need for it either. Maybe should brush up on the object methods, but all in all, it doesn’t bother me._
- [x] **Functions & pure functions**.<br> _Check, I guess._
- [ ] **Closures**. <br>_Still forget sometimes what’s referenced, and what’s used as a value. Calls for a post._
    - [ ] Read YDKJS: Scope and closures
    - [ ] Write a post, at least
- [x] **Callbacks**.<br> _Check._

### Practical stuff

- [ ] **Promises**. <br>_Read [a book](http://shop.oreilly.com/product/0636920032151.do), liked it, haven’t use them much since.
    - [ ] Maybe just wait for a chance to use them practically.
    - [ ] Or maybe process the book and find the way to practice.
- [ ] **Browsers & DOM**.<br>_Not much._
    - [ ] [JavaScript 30](https://javascript30.com/)
    - [ ] [http://superherojs.com/#browser](http://superherojs.com/#browser)
    - [ ] [Flannagan](http://shop.oreilly.com/product/9780596805531.do), since I own it anyway.
- [ ] **Ajax & server API calls**. <br>_Not really._
    - [ ] Again, [Flannagan](http://shop.oreilly.com/product/9780596805531.do).
    - [ ] [https://github.com/mzabriskie/axios](https://github.com/mzabriskie/axios)
    - [ ] And what’s my project?
- [ ] **Progressive Web Applications** (PWAs). Offline-first w/service workers.<br>_Nope._
    - [ ] [https://medium.com/javascript-scene/native-apps-are-doomed-ac397148a2c0#.g5yehmjen](https://medium.com/javascript-scene/native-apps-are-doomed-ac397148a2c0#.g5yehmjen)
    - [ ] [https://medium.com/javascript-scene/why-native-apps-really-are-doomed-native-apps-are-doomed-pt-2-e035b43170e9#.skuxf7bcm](https://medium.com/javascript-scene/why-native-apps-really-are-doomed-native-apps-are-doomed-pt-2-e035b43170e9#.skuxf7bcm)
- [ ] **Node & Express**.<br>_Didn’t even start._
    - [ ] [https://medium.com/javascript-scene/introduction-to-node-express-90c431f9e6fd#.7zpzupnoz](https://medium.com/javascript-scene/introduction-to-node-express-90c431f9e6fd#.7zpzupnoz)
- [x] **Lodash:**.<br> _Used some of it, have never used the fp flavor_.
- [ ] **Security**.<br> _Don’t know squat._
    - [ ] [http://superherojs.com/#security](http://superherojs.com/#security)

### ES6

- [ ] **ES6**. <br>_Know_ some _of it, but not enough._
    - [ ] Maybe create a checklist for the known features
    - [ ] Start with [http://bdadam.com/blog/video-douglas-crockford-about-the-new-good-parts.html](http://bdadam.com/blog/video-douglas-crockford-about-the-new-good-parts.html).
    - [ ]  [http://www.2ality.com/2016/05/six-nifty-es6-tricks.html](http://www.2ality.com/2016/05/six-nifty-es6-tricks.html)
    - [ ] [http://exploringjs.com/es6.html](http://exploringjs.com/es6.html)
    - [ ] [http://exploringjs.com/setting-up-es6.html](http://exploringjs.com/setting-up-es6.html)
    - [ ] [http://exploringjs.com/es2016-es2017.html](http://exploringjs.com/es2016-es2017.html)
- [ ] **Generators & async/await**. <br>_Had some XP with generators because I’ve used JS-CSP for Chops (feels boilerplatey)._
    - [ ] Maybe wait for another opportunity to use them.

### Patterns & architecture
- [ ] **Classes**. 
    - [x] Used them in TypeScript, with shallow inheritance. They kinda work.
    - [ ] Learn alternative patterns (use more factories, learn composition &c)
    - [ ] YDKJS: `this` and Object Prototypes
- [ ] **Patterns**. 
    - [x] Have_ read [Stoyan Stefanov](http://shop.oreilly.com/product/9780596806767.do) once
    - [ ] need to process it
    - [ ] and put it in practice
    - [ ] Also read [Design Patterns Explained Simply](https://sourcemaking.com/design-patterns-ebook)
    - [ ] And try [Reactive Data Handling](https://www.manning.com/books/reactive-data-handling) for a preview

- **FP basics**.
    - [ ] [https://github.com/getify/Functional-Light-JS#book](https://github.com/getify/Functional-Light-JS#book)
    - [ ] [https://github.com/hemanth/functional-programming-jargon](https://github.com/hemanth/functional-programming-jargon)
    - [ ] [https://drboolean.gitbooks.io/mostly-adequate-guide/content/](https://drboolean.gitbooks.io/mostly-adequate-guide/content/)
    - [ ] Try FP Lodash
    - [ ] Try Ramda
    - [ ] Try Transducers (once I understand what they do)

##- Tooling
- [ ] **Chrome Dev Tools**.
    - [ ] Have used Dom Inspect with Chrome.
    - [ ] Didn’t give much use to JS Debugger. Did a bit of debugging in WebStorm though.
    - [x] Npm:<br>_Well, I’m not an expert, obviously, but._
    - [x] git & GitHub: _Same as above. Not the bottleneck right now._
    - [ ] Babel:<br>_Had a brief encounter, probably will get back to it with new projects. It definitely feels like Babel-generated code is more robust than TS-generated one. Which might matter for, say, npm packages._
- [ ] Webpack: <br>_I should totally look at that._
- [x] **Atom, VSCode, or WebStorm + vim**,<br> _Tried all three, staying with WebStorm for now. As for vim, I should spend more time with it. Right now I only used Nano for simplistic editing._
- [ ] **ESLint**. <br>
    - [ ] I did use some built-in linting in WebStorm
    - [ ] including TSLint
    - [ ] but maybe I need to set it up more deliberately, as I take on some bigger projects.
- [ ] Tern.js: <br>_Eric Elliott swears by it. If only there was a way to make it work in WebStorm._
- [x] Yarn: 
    - [x] It works.
    - [ ] But maybe I should switch to it completely and learn more of it.
- [x] TypeScript.<br>_Found myself reaching for it when I needed some to figure out my data types for Chops. Still not sure it was worth it, but maybe if I learn to trust type inference... Setting it up is actually pretty easy. The tedious part is type declarations and typings setup._
- [ ] **Performance**: _Nope._
    - [ ] [https://developers.google.com/speed/pagespeed/insights/](https://developers.google.com/speed/pagespeed/insights/)
    - [ ] [https://www.webpagetest.org/](https://www.webpagetest.org/)
    - [ ] [https://www.youtube.com/watch?v=QH94CXVv3UE](https://www.youtube.com/watch?v=QH94CXVv3UE)
    - [ ] [http://superherojs.com/#performance](http://superherojs.com/#performance)
    - [ ] YDKJS: Async & Performance
- **Testing**: 
    - [ ] Wrote a few tests in AVA. Not nearly enough.
    - [ ] Write tests for Chops.
    - [ ] [http://www.letscodejavascript.com/](http://www.letscodejavascript.com/)
    - [ ] [Beautiful Testing](http://shop.oreilly.com/product/9780596159825.do)
    - [ ] Maybe [The Psychology of Code Testability](https://frontendmasters.com/courses/angularjs-and-code-testability/), if it’s not too married to Angular
    - [ ] Maybe look at [Testable JavaScript](http://shop.oreilly.com/product/0636920024699.do) (the reviews are not really encouraging, so maybe I’ll get all that info elsewhere).

## Frameworks

### React.

_Long due._

- [ ] [https://medium.com/javascript-scene/the-best-way-to-learn-to-code-is-to-code-learn-app-architecture-by-building-apps-7ec029db6e00#.8zntxy2rm](https://medium.com/javascript-scene/the-best-way-to-learn-to-code-is-to-code-learn-app-architecture-by-building-apps-7ec029db6e00#.8zntxy2rm)
- [ ] [https://github.com/facebookincubator/create-react-app](https://github.com/facebookincubator/create-react-app)
- [ ] [https://github.com/ReactTraining/react-router](https://github.com/ReactTraining/react-router)
- [ ] [https://zeit.co/blog/next](https://zeit.co/blog/next)
- [ ] [https://github.com/twitter-fabric/velocity-react](https://github.com/twitter-fabric/velocity-react)

### Redux.

_Same as React, looong due._

- [ ] [https://medium.com/javascript-scene/10-tips-for-better-redux-architecture-69250425af44](https://medium.com/javascript-scene/10-tips-for-better-redux-architecture-69250425af44)
- [ ] [https://github.com/redux-saga/redux-saga](https://github.com/redux-saga/redux-saga)
- [ ] Maybe this at some point: [https://egghead.io/courses/getting-started-with-redux](https://egghead.io/courses/getting-started-with-redux) (not sure I’m willing to pay for both Frontend Masters and egghead.io at the same time)
- [ ] And this: [https://egghead.io/courses/building-react-applications-with-idiomatic-redux](https://egghead.io/courses/building-react-applications-with-idiomatic-redux)

### RxJS

_Started- to use it in Chops, then got lured by JS-CSP. Still curious._