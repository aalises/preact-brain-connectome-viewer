import { h, render } from "preact";
import ConnectomeView from "./components/ConnectomeView";

render(<ConnectomeView thres={0.12} 
  groupsList = {["Right","Subcortical-Right","Brainstem","Subcortical-Left","Left"]} 
  colorPalette = {["#800000","#e6b800","#669999","#00802b","#2a2aa2"]} 
  />,
  document.getElementById("root")
);
