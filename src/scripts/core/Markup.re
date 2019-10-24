type t =
  | Markdown(string);

let toString =
  fun
  | Markdown(s) => s;

let map = (m, ~f) =>
  switch (m) {
  | Markdown(s) => Markdown(s->f)
  };

let flatMap = (m, ~f) =>
  switch (m) {
  | Markdown(s) => f(s)
  };

let toReact = flatMap(~f=s => Remark.(processor->processSync(s)->contents));
