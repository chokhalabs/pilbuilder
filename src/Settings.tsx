import { useRef } from "react";
import { assertNever, isMouseareaNode, isStateFulNode, ItemImage, ItemNode, MouseArea, PilNode } from "./pilBase";
export default function(props: {node: PilNode; onNodeUpdate: (node: PilNode) => void; }) {
  const { node, onNodeUpdate } = props;
  const filePicker = useRef<HTMLInputElement>(null);
  let settings = (<div>Select a node to edit its settings</div>);
  
  function onImageUpdate(image: ItemImage) {
    switch (node.type) {
      case "Text":
        console.error("Cannot set image on TextNode")
        break;
      case "TextEdit":
      case "Item":
        {
          let images = node.images.map(img => {
            if (img.id !== image.id) {
              return img;
            } else {
              return image;
            }
          });

          let newNode = {
            ...node,
            images
          };
          onNodeUpdate(newNode);
        }
        break;
      default: 
        return assertNever(node);
    }
  }

  function onMouseareaUpdate(mouseArea: MouseArea) {
    if (isMouseareaNode(node)) {
      onNodeUpdate({
        ...node,
        mouseArea
      });    
    } else {
      console.error("Cannot update mouse area on this node");
    }
  }

  function uploadFile() {
    switch (node.type) {
      case "Text":
        console.error("Cannot upload image in text node");
        break;
      case "TextEdit":
      case "Item":
        {
        const formData = new FormData();
        let file = null; 
        if (filePicker.current) {
          // @ts-ignore
          file = filePicker.current.files[0];
          formData.append("image", file);
        }
        fetch("http://localhost:3030/images", {
          method: "POST",
          body:  formData
        })
        .then(res => res.json())
        .then(res => {
          const images = node.images.concat({
            id: res.filename,
            source: `http://localhost:3030/image/${res.filename}`,
            visible: false,
            x: 0,
            y: 0,
            ref: null,
            downloaded: null
          });

          onNodeUpdate({
            ...node,
            images
          });
        })
        .catch(err => {
          console.error("Failed to upload image file", err);
        })
        }
        break;
      default:
        return assertNever(node);
    }
    
  }

  if (node.type === "Item") {
    let images = null;
    if (node.images) {
      images = node.images.map(it => {
        return (
          <div key={it.source}>
            <img src={it.source}></img>
            <label>visible
              <input 
                type="checkbox" 
                checked={it.visible} 
                onChange={(ev) => onImageUpdate({ ...it, visible: ev.target.checked })}
              >
              </input>
            </label>
          </div>
        );
      });
    }

    

    let mouseArea = null;
    mouseArea = (
      <div>
        <div>x</div>
        <input 
          type="number" 
          value={node.mouseArea.x} 
          onChange={ev => onMouseareaUpdate({ ...node.mouseArea, x: parseFloat(ev.target.value) })}
        />

        <div>y</div>
        <input 
          type="number" 
          value={node.mouseArea.y} 
          onChange={ev => onMouseareaUpdate({ ...node.mouseArea, y: parseFloat(ev.target.value) })}
        />

        <div>width</div>
        <input 
          type="number" 
          value={node.mouseArea.width} 
          onChange={ev => onMouseareaUpdate({ ...node.mouseArea, width: parseFloat(ev.target.value) })}
        />

        <div>height</div>
        <input 
          type="number" 
          value={node.mouseArea.height} 
          onChange={ev => onMouseareaUpdate({ ...node.mouseArea, height: parseFloat(ev.target.value) })}
        />

        <div>
          <input 
            type="checkbox" 
            checked={node.mouseArea.draw} 
            onChange={(e) => onMouseareaUpdate({ ...node.mouseArea, draw: e.target.checked })} 
          />
            show boundingbox
          </div>
        <div>onmousedown 
          <div>
            <input type="radio" name="mousedown" />
            emit event
            <input type="text" />
          </div>
        </div>
      </div>
    );

    

    settings = (
      <div>
        <div>x</div>
        <input 
          type="number" 
          value={node.x} 
          onChange={ev => onNodeUpdate({ ...node, x: parseFloat(ev.target.value) })}
        />

        <div>y</div>
        <input 
          type="number" 
          value={node.y} 
          onChange={ev => onNodeUpdate({ ...node, y: parseFloat(ev.target.value) })}
        />

        <div>width</div>
        <input 
          type="number" 
          value={node.width} 
          onChange={ev => onNodeUpdate({ ...node, width: parseFloat(ev.target.value) })}
        />

        <div>height</div>
        <input 
          type="number" 
          value={node.height} 
          onChange={ev => onNodeUpdate({ ...node, height: parseFloat(ev.target.value) })}
        />

        <div>
          <input type="checkbox" 
            checked={node.draw} 
            onChange={(ev) => onNodeUpdate({ ...node, draw: ev.target.checked })}
          />
          Show Boundingbox
        </div>

        <div>Images</div>
        {images}
        <input type="file" ref={filePicker} /> <button onClick={uploadFile}>Upload</button>
        {mouseArea && <div>MouseArea</div> }
        {mouseArea}
      </div>
    );
  } else if (node.type === "Text") {
    settings = (
      <div>
        <div> value
          <input 
            type="text" 
            onChange={ev => onNodeUpdate({ ...node, text: ev.target.value })} 
            value={node.text}
          />
        </div>
        <div> color
          <input 
            type="color" 
            onChange={ev => onNodeUpdate({ ...node, color: ev.target.value })} 
            value={node.color}
          />
        </div>
        <div> maxWidth
          <input 
            type="number" 
            onChange={ev => onNodeUpdate({ ...node, width: parseFloat(ev.target.value) })} 
            value={node.width}
          />
        </div>
      </div>
    );
  }

  let states = null;
  if (isStateFulNode(node)) {
    states = node.states.map(it => {
      return (
        <div key={it.name}>
          <input 
            type="radio" 
            name="state" 
            value={it.name} 
            checked={node.state === it.name} 
            onChange={() => onNodeUpdate({ ...node, state: it.name })}
          />
          {it.name}
          : activates when mouseArea
          <textarea value={it.when} onChange={() => {}}></textarea>
        </div>
      );
    });
  }

  return (<div>
    {states}
    {settings}
  </div>);
}
