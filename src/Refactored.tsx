import { useRef, useEffect } from "react";

import { mount, init, ItemNode, PilNodeExpression, paint, ColumnNode, RowNode, TextEditNode } from "./design";

export default function() {
  const canvas = useRef(null); 

  useEffect(() => {
    const expr: PilNodeExpression<ItemNode> = {
      definition: {
        id: "button",
        type: "Item",
        x: 10,
        y: 10,
        width: 50,
        height: 50,
        draw: true,
        images: [
          {
            id: "normalstateimage",
            source: "http://localhost:3000/normal.png",
            visible: true,
            downloaded: null
          },
          {
            id: "pressedstateimage",
            source: "http://localhost:3000/pressed.png",
            visible: false,
            downloaded: null
          }
        ],
        state: "normal",
        states: [
          {
            name: "normal",
            when: "mouseup",
            propertyChanges: [
              {
                target: "normalstate",
                visible: true
              },
              {
                target: "pressedstate",
                visible: false
              }
            ],
            onEnter: []
          },
          {
            name: "pressed",
            when:"mousedown",
            propertyChanges: [
              {
                target: "normalstate",
                visible: false
              },
              {
                target: "pressedstate",
                visible: true
              }
            ],
            onEnter: []
          }
        ],
        mouseArea: {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          listeners: {},
          customEvents: {
            click: {
              when: "mouseup",
              payload: ""
            }
          }
        },
        children: {},
        animations: []
      },
      props: {
        
      },
      eventHandlers: {},
    };

    if (canvas.current) {
      init(expr).then(instance => {
        (window as any).instance = instance;
        return mount(instance, "#mountpoint").then(paintreqs => {
          return paint(paintreqs); 
        })
      }).catch(err => {
        console.error(`Failed to initialize expression, ${expr}`, err);
      });
    }
  }, [canvas]);

  return (
    <canvas
      id="mountpoint" 
      width="700" 
      height="500"
      style={{ border: 'solid 1px' }}
      ref={canvas}
    >
    </canvas>
  );
}