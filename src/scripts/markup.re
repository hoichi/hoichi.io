type t =
  | Markdown(string);

let toString =
  fun
  | Markdown(s) => s;

let map = (m, ~f) =>
  switch (m) {
  | Markdown(s) => Markdown(s->f)
  };
