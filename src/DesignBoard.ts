import React, { createElement as h, useEffect, useRef, useState } from "react";
import { Config, tranformToVDOM } from "./utils";
import { Text, Stage, Layer, Group } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";

type Props = { 
  leftsidebarWidth: number; 
  menubarHeight: number; 
  conf: Config[]; 
  onDrop: (arg: { x: number; y: number; id: string|undefined; }) => void;
  components: Array<{ name: string }>;
  cursor: string;
  onMouseDown: (arg: KonvaEventObject<MouseEvent>) => void;
  onMouseUp: (arg: KonvaEventObject<MouseEvent>) => void;
  onMouseMove: (arg: KonvaEventObject<MouseEvent>) => void;
}

export default function(props: Props) {
  const nodes = props.conf.map((config, i) => h(tranformToVDOM(config, { key: "rect-" + i })));
  // let content: ReturnType<typeof h> = h(Group, { key: "" }, nodes);

  const stageNode = useRef(null);
  const [ dropListener, setDropListener ] = useState(null as any);

  useEffect(() => {
    if (stageNode.current) {
      const root: any = stageNode.current;
      const canvas: HTMLCanvasElement = root.children[0].canvas._canvas;
      // console.log("Adding event listener")
      if (!dropListener) {
        canvas.addEventListener("dragover", (ev) => {
          // console.log("Dragover: ", ev)
          ev.stopPropagation();
          ev.preventDefault();
        })
      }
      console.log("Adding eventlistener")
      canvas.removeEventListener("drop", dropListener?.listener);
      const newDropListener = (ev: any) => {
        const id = ev?.dataTransfer?.getData("text") ?? "event not found";
        props.onDrop({
          x: ev?.x ?? 10,
          y: ev?.y ?? 10,
          id: id
        });
      };
      setDropListener({ listener: newDropListener });
      canvas.addEventListener("drop", newDropListener);
    } else {
      console.error("Could not attach drop listener");
    }
  }, [stageNode, props.components]);

  return h(Stage, 
    {
      ref: stageNode,
      width: window.innerWidth - props.leftsidebarWidth,
      height: window.innerHeight - props.menubarHeight,
      className: "stage",
      key: "designboard",
      style: { cursor: props.cursor },
      onMouseDown: props.onMouseDown,
      onMouseUp: props.onMouseUp,
      onMouseMove: props.onMouseMove
    },
    [
      h(Layer,
        {
          key: "layer1"
        },
        nodes
      )
    ]
  );
}
