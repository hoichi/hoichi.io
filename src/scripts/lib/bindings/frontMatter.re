type parseResult = {
  .
  "body": string,
  "attributes": Js.Json.t,
};

[@bs.module] external parse: string => parseResult = "front-matter";
