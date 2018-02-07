import * as React from "react";
import * as ReactDOM from "react-dom";
import ConnectomeView from "./components/ConnectomeView";

ReactDOM.render(
  <ConnectomeView thres={0.12} />,
  document.getElementById("root")
);
