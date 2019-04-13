module RR = ReasonReact;

[@react.component]
let make = () => {
  <footer id="colophon" className="b-Colophon u-centered" role="contentinfo">
    <p> {RR.string("---")} </p>
  </footer>;
};
