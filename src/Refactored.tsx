import { useRef, useEffect } from "react";

import { mount, init, ItemNode, PilNodeExpression, paint } from "./design";

export default function() {
  const canvas = useRef(null); 

  useEffect(() => {
    const item: ItemNode = {
      type: "Item",
      id: "1",
      x: { value: 10, context: "", def: "" },
      y: { value: 10, context: "", def: "" },
      width: { value: 50, context: "", def: "" },
      height: { value: 50, context: "", def: "" },
      draw: true,
      mouseArea: {
        x: { value: 10, context: "", def: "" },
        y: { value: 10, context: "", def: "" },
        width: { value: 50, context: "", def: "" },
        height: { value: 50, context: "", def: "" },
        listeners: {},
        customEvents: {}
      },
      children: {},
      state: "default",
      states: [{
        name: "default",
        when: "mousedown",
        propertyChanges: [],
        onEnter: []
      }],
      images: []
    };

    const expr: PilNodeExpression<ItemNode> = {
      definition: item,
      props: {},
      eventHandlers: {}
    };


    if (canvas.current) {
      init(expr).then(instance => {
        (window as any).instance = instance;
        mount(instance, "#mountpoint").then(paintreqs => {
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