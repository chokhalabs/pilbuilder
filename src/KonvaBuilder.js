import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';
import { createElement as h } from 'react';
import "./App.css";
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
          null,
          [
            h(Text, 
              {
                text: "Try clicking on the rect"
              }  
            ),
            h(Rect, 
              {
                x: 20,
                y: 20,
                width: 50,
                height: 50,
                fill: Konva.Util.getRandomColor(),
                shadowBlur: 5
              }
            )
          ]
        )
      ]
    )
  );
}