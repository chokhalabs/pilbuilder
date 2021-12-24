import { Stage, Layer } from 'react-konva';
// import Konva from 'konva';
import { createElement as h } from 'react';
import "./App.css";
import { tranformToVDOM, config } from "./Button";

const Button = tranformToVDOM(config, { title: "Click here", size: "Regular" });

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
          h(Button)
        )
      ]
    )
  );
}