import { Stage, Layer } from 'react-konva';
// import Konva from 'konva';
import { createElement as h } from 'react';
import "./App.css";
import Button, { tranformToVDOM, config } from "./Button";


const BTn = h(Button, { title: "Click here", size: "regular" });
console.log("Button: ", BTn);

const Btn = h(tranformToVDOM(config, { title: "Click here", size: "Regular" }));
console.log("Btn: ", Btn);

export default function() {
  return (
    h(Stage, 
      {
        width: window.innerWidth,
        height: window.innerHeight,
        className: "konvaroot"
      },
      [
        h(Layer,
          {
            key: "layer1"
          },
          Btn
        )
      ]
    )
  );
}