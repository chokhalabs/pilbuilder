import { Stage, Layer } from 'react-konva';
// import Konva from 'konva';
import { createElement as h } from 'react';
import "./App.css";
import Button from "./Button";

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
          h(
            Button,
            {
              title: "Click here",
              size: "Regular" 
            }
          )
        )
      ]
    )
  );
}