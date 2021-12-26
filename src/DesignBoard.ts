import { createElement as h, useEffect, useRef } from "react";
import { Config, tranformToVDOM } from "./utils";
import { Text, Stage, Layer } from "react-konva";

type Props = { 
  leftsidebarWidth: number; 
  menubarHeight: number; 
  conf: Config | null; 
  onDrop: (arg: { x: number; y: number; id: string|undefined; }) => void
}

export default function(props: Props) {
  let content: ReturnType<typeof h> = h(Text, { text: "Not loaded yet!" });
  if (props.conf) {
    content = h(tranformToVDOM(props.conf, { title: "Click here", size: "Regular" }));
  }

  const stageNode = useRef(null);

  useEffect(() => {
    if (stageNode.current) {
      const root: any = stageNode.current;
      const canvas: HTMLCanvasElement = root.children[0].canvas._canvas;
      // console.log("Adding event listener")
      console.log("Adding eventlistener")
      canvas.addEventListener("drop", (ev) => {
        const id = ev.dataTransfer?.getData("text");
        props.onDrop({
          x: ev.x,
          y: ev.y,
          id: id
        });
      });
      canvas.addEventListener("dragover", (ev) => {
        // console.log("Dragover: ", ev)
        ev.stopPropagation();
        ev.preventDefault();
      })
    } else {
      console.error("Could not attach drop listener");
    }
  }, [stageNode]);

  return h(Stage, 
    {
      ref: stageNode,
      width: window.innerWidth - props.leftsidebarWidth,
      height: window.innerHeight - props.menubarHeight,
      className: "stage",
      key: "designboard"
    },
    [
      h(Layer,
        {
          key: "layer1"
        },
        content
      )
    ]
  );
}
