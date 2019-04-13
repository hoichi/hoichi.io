module RR = ReasonReact;

[@react.component]
let make = (~content) => {
  let dangerouslySetInnerHTML = {"__html": content};

  <main id="content" className="Content u-centered" role="main">
    <article dangerouslySetInnerHTML />
  </main>;
};
