type t;

let make: unit => t;

let add: (t, Post.t) => t;

let toArray: t => array(Post.t);
