import { useRef, useState } from "react";
import './App.css';
import { AppBase } from "./pilBase";

function App() {
  const canvas = useRef(null);
  const filePicker = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [selectedNode, selectNode] = useState("myButton_Symbol");
  const [pil, _setPil] = useState({
    "Item": {
      "id": "myButton_Symbol",
      "type": "Item",
      "width": 115,
      "height": 100,
      "x": 0,
      "y": 0,
      "draw": false,
      "state": "normal",
      "images": [],
      "mouseArea": {
        "id": "mouseArea",
        "x": 0,
        "y": 0,
        "width": 115,
        "height": 100,
        "hoverEnabled": false,
        "mousedown": true,
        "mouseup": true,
        "draw": false
      },
      states: [
        {
          "name": "normal",
          "when": "mouseup",
          "propertyChanges": []
        },
        {
          "name": "pressed",
          "when": "mousedown",
          "propertyChanges": []
        }
      ],
      children: {
        text1: {
          type: "Text",
          id: "text1",
          width: 100,
          text: "Some text here",
          color: "#000000"
        },
        text2: {
          type: "Text",
          id: "text2",
          width: 100,
          text: "Some other text here",
          color: "#FF0000"
        }
      }
    }
  });

  const setPil = function(state) {
    render();
    _setPil(state);
  }

  function setPilState(state) {
    
    const newPil = {
      Item: {
        ...pil.Item,
        state
      }
    };

    // Apply property changes
    const target_state = newPil.Item.states.find(it => it.name === state);
    const propertyChanges = target_state.propertyChanges;

    for (let change of propertyChanges) {
      const target = newPil.Item.images.find(it => it.id === change.target);
      if (target)
        target.visible = change.visible;
    }

    setPil(newPil);
  }

  function setPilMouseArea(mouseArea) {
    setPil({
      Item: {
        ...pil.Item,
        mouseArea
      }
    })
  }

  function setPilItem(item) {
    setPil({
      Item: item
    })
  }

  function onZoomChange(ev) {
    setZoom(ev.target.value);
  }

  function setStateCondition(ev, state) {
    const value = ev.target.value;
    const newPil = {
      Item: {
        ...pil.Item,
        states: pil.Item.states.map(item => {
          if (item.name !== state.name) {
            return item;
          } else {
            return {
              ...item,
              when: value
            }
          }
        })
      }
    };
    setPil(newPil);
  }

  function wireImageToState(ev, image) {
    const newStates = pil.Item.states.map(currentState => {
      if (currentState.name === pil.Item.state) {
        const existingChange = currentState.propertyChanges.find(it => it.target === image.id && it.visible !== undefined);
        if (existingChange) {
          existingChange.visible = ev.target.checked;
        } else {
          currentState.propertyChanges.push({
            target: image.id,
            visible: ev.target.checked
          })
        }
      }
      return currentState;
    });
    
    const newImages = pil.Item.images.map(it => {
      if (it.id === image.id) {
        it.visible = ev.target.checked;
      }
      return it;
    })

    setPil({
      Item: {
        ...pil.Item,
        states: newStates,
        images: newImages
      }
    })
  }

  const states = pil.Item.states.map(it => {
    return (
      <div key={it.name}>
        <input 
          type="radio" 
          name="state" 
          value={it.name} 
          checked={pil.Item.state === it.name} 
          onChange={() => setPilState(it.name)}
        />
        {it.name}
        : activates when mouseArea
        <textarea value={it.when} onChange={ev => setStateCondition(ev, it)}></textarea>
      </div>
    );
  });

  // const images = pil.Item.images.map(it => {
  //   return (
  //     <div key={it.source}>
  //       <img src={it.source}></img>
  //       <label>visible
  //         <input type="checkbox" checked={it.visible} onChange={(ev) => wireImageToState(ev, it)}></input>
  //       </label>
  //     </div>
  //   );
  // });

  function findCurrentNode(node) {
    if (node.id === selectedNode) {
      return node;
    } else {
      let childnode = Object.values(node.children || {}).map(child => {
        return findCurrentNode(child);
      }).filter(it => !!it);
      if (childnode.length === 1) {
        return childnode[0];
      } else if (childnode.length > 1) {
        console.error("Multiple nodes with selected id!");
        return null;
      } else {
        console.info("no node is selected");
        return null;
      }
    }
  }

  // Find out which node's settings to render and  update the settings bar
  const currentNode = findCurrentNode(pil.Item);
  let settings = (<div>Select a node to edit its settings</div>);
  if (currentNode.type === "Item") {
    let images = null;
    if (currentNode.images) {
      images = currentNode.images.map(it => {
        return (
          <div key={it.source}>
            <img src={it.source}></img>
            <label>visible
              <input type="checkbox" checked={it.visible} onChange={(ev) => wireImageToState(ev, it)}></input>
            </label>
          </div>
        );
      });
    }

    let mouseArea = null;
    if (currentNode.mouseArea) {
      mouseArea = (
        <div>
          <div>X</div>
          <input type="number" value={currentNode.mouseArea.x} readOnly/>
          <div>Y</div>
          <input type="number" value={currentNode.mouseArea.y} readOnly/>
          <div>Width</div>
          <input type="number" value={currentNode.mouseArea.width} readOnly/>
          <div>Height</div>
          <input type="number" value={currentNode.mouseArea.height} readOnly/>
          <div>
            <input 
              type="checkbox" 
              checked={currentNode.mouseArea.draw} 
              onChange={(e) => setPilMouseArea({ ...currentNode.mouseArea, draw: e.target.checked })} 
            />
              Show Boundingbox
            </div>
          <div>OnMousedown 
            <div>
              <input type="radio" name="mousedown" />
              Emit event
              <input type="text" />
            </div>
          </div>
        </div>
      );
    }

    settings = (
      <div>
        <div>X</div>
        <input type="number" value={currentNode.x} readOnly/>
        <div>Y</div>
        <input type="number" value={currentNode.y} readOnly/>
        <div>Width</div>
        <input type="number" value={currentNode.width} readOnly/>
        <div>Height</div>
        <input type="number" value={currentNode.height} readOnly/>
        <div>
          <input type="checkbox" 
            checked={currentNode.draw} 
            onChange={(e) => setPilItem({ ...pil.Item, draw: e.target.checked })}
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
  } else if (currentNode.type === "Text") {
    settings = (
      <div>
        <div> value
          <input type="text" readOnly value={currentNode.text}></input>
        </div>
        <div> color
          <input type="color" readOnly value={currentNode.color}></input>
        </div>
        <div> maxWidth
          <input type="number" readOnly value={currentNode.width}></input>
        </div>
      </div>
    );
  }

  const mouseArea = (
    <div>
      <div>X</div>
      <input type="number" value={pil.Item.mouseArea.x} readOnly/>
      <div>Y</div>
      <input type="number" value={pil.Item.mouseArea.y} readOnly/>
      <div>Width</div>
      <input type="number" value={pil.Item.mouseArea.width} readOnly/>
      <div>Height</div>
      <input type="number" value={pil.Item.mouseArea.height} readOnly/>
      <div>
        <input 
          type="checkbox" 
          checked={pil.Item.mouseArea.draw} 
          onChange={(e) => setPilMouseArea({ ...pil.Item.mouseArea, draw: e.target.checked })} 
        />
          Show Boundingbox
        </div>
      <div>OnMousedown 
        <div>
          <input type="radio" name="mousedown" />
          Emit event
          <input type="text" />
        </div>
      </div>
    </div>
  );

  function render() {
    let app = new AppBase();
    app.item = pil.Item;
    app.mount(canvas.current);
  }

  function eject() {
    fetch("http://localhost:3030/", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pil)
    })
    .then(res => res.json())
    .then(res => {
      console.log("Project created: ", res.generated_project);
      downloadProject(res.generated_project);
    })
  }

  function downloadProject(uuid) {
    console.log("Waiting 5 sec");
    setTimeout(() => {
      console.log("Trying...");
      fetch(`http://localhost:3030/project/${uuid}`)
      .then(res => {
        if (res.statusCode === 404) {
          downloadProject(uuid);
          return Promise.reject();
        } else {
          return Promise.resolve();
        }
      })
      .then(() => {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = `http://localhost:3030/project/${uuid}`;
        a.download = uuid;
        a.click();
        document.body.removeChild(a);
      })
      .catch(err => {
        if (err.statusCode === 404) {
          downloadProject(uuid);
        } else {
          console.error("Failed to download: ", err);
        }
      })
    }, 5000);
  }

  function uploadFile() {
    const formData = new FormData();
    const file = filePicker.current.files[0];
    formData.append("image", file);
    fetch("http://localhost:3030/images", {
      method: "POST",
      body:  formData
    })
    .then(res => res.json())
    .then(res => {
      const newImages = pil.Item.images.concat({
        id: res.filename,
        source: `http://localhost:3030/image/${res.filename}`,
        visible: false,
        x: 0,
        y: 0
      });

      setPil({
        Item: {
          ...pil.Item,
          images: newImages
        }
      })
    })
    .catch(err => {
      console.error("Failed to upload image file");
    })
  }

  const pilTree = (
    <div>
      { renderPilTree(pil.Item) }
    </div>
  );

  function renderPilTree(node) {
    const isSelected = node.id === selectedNode;
    return (
      <div>
        <div style={{ color: isSelected ? "cornflowerblue": "white", cursor: "pointer" }} onClick={() => selectNode(node.id)}>{node.type}</div>
        <div style={{'margin-left': 10 }}>
          {node.children ? Object.values(node.children).map(child => renderPilTree(child)) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="states">
        States
        {states}
        <div>Pil</div>
        {pilTree}
      </div>
      <div className="canvas">
        <canvas 
          width="1600" 
          height="1200" 
          ref={canvas}
          style={{
            transform: "scale(" + zoom + ")"
          }}
        >
        </canvas>
      </div>
      <div className="settings">
        Settings
        {settings}
        <input 
          type="range" 
          value={zoom} 
          onChange={ev => onZoomChange(ev)} 
          min="0.2"
          max="1"
          step="0.1"
        />
        <div>
          <button onClick={render}>Render</button>
        </div>
        <div>
          <button onClick={eject}>Eject</button>
        </div>
      </div>
    </div>
  );
}

export default App;
