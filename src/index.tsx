import { h, render } from "preact";
import ConnectomeView from "./components/ConnectomeView";

render(
  <ConnectomeView 
    thres={0.12} 
    groupsList={["Right","Subcortical-Right","Brainstem","Subcortical-Left","Left"]} 
    colorPalette={["#357066","#d1c34f","#9c9ede","#c99231","#854034"]} 
  />,
  document.getElementById("root")
);
