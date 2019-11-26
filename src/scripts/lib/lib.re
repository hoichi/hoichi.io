module Option = {
  include Belt.Option;

  let or_ = (type v, o: option(v), f: unit => option(v)) =>
    switch (o) {
    | Some(v) => Some(v)
    | None => f()
    };
};

module Decode = {
  include Json.Decode;

  exception Invalid(string);
  exception Empty(string);

  let assert_ = (condition, msg, decode, json) => {
    let value = decode(json);
    if (condition(value)) {
      value;
    } else {
      raise(Invalid(msg));
    };
  };
};
