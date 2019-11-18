type t;

type feed = {
  tag: string,
  feed: Collection.t,
};

let make: unit => t;

/**
 * Add/update a post to whichever collections
 */
let add: (t, Post.t) => t;

/**
 * Get a list of all the collections since forever
 */
let all: t => list(feed);

/**
 * Get a list of all the collections affected by the latest add
 */
let latest: t => list(feed);
