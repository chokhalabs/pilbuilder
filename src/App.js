import { useRef, useState } from "react";
import './App.css';
import { AppBase } from "./pilBase";

function App() {
  const canvas = useRef(null);
  const [pil, setPil] = useState({
    "Item": {
      "id": "myButton_Symbol",
      "width": 115,
      "height": 100,
      "draw": false,
      "state": "normal",
      "images": [
        {
          "id": "myButton_Symbol_normal",
          "x": 10,
          "y": 10,
          "source": "/normal.png",
          "visible": true
        },
        {
          "id": "myButton_Symbol_pressed",
          "x": 10,
          "y": 10,
          "source": "/pressed.png",
          "visible": false
        }
      ],
      "mouseArea": {
        "x": 10,
        "y": 10,
        "width": 115,
        "height": 100,
        "hoverEnabled": false,
        "mousedown": true,
        "mouseup": true,
        "draw": false
      },
      "states": [
        {
          "name": "normal",
          "propertyChanges": [
            {
              "target": "myButton_Symbol_normal",
              "visible": true
            },
            {
              "target": "myButton_Symbol_pressed",
              "visible": false
            }
          ]
        },
        {
          "name": "pressed",
          "propertyChanges": [
            {
              "target": "myButton_Symbol_normal",
              "visible": false
            },
            {
              "target": "myButton_Symbol_pressed",
              "visible": true
            }
          ]
        }
      ]
    }
  });

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
      </div>
    );
  });

  const images = pil.Item.images.map(it => {
    return (
      <div key={it.source}>
        <img src={it.source}></img>
        <label>visible
          <input type="checkbox" checked={it.visible}></input>
        </label>
      </div>
    );
  })

  const settings = (
    <div>
      <div>Width</div>
      <input type="number" value={pil.Item.width}/>
      <div>Height</div>
      <input type="number" value={pil.Item.height}/>
      <div>
        <input type="checkbox" 
          checked={pil.Item.draw} 
          onChange={(e) => setPilItem({ ...pil.Item, draw: e.target.checked })}
        />
        Show Boundingbox
      </div>
    </div>
  );

  const mouseArea = (
    <div>
      <div>X</div>
      <input type="number" value={pil.Item.mouseArea.x}/>
      <div>Y</div>
      <input type="number" value={pil.Item.mouseArea.y}/>
      <div>Width</div>
      <input type="number" value={pil.Item.mouseArea.width}/>
      <div>Height</div>
      <input type="number" value={pil.Item.mouseArea.height}/>
      <div>
        <input 
          type="checkbox" 
          checked={pil.Item.mouseArea.draw} 
          onChange={(e) => setPilMouseArea({ ...pil.Item.mouseArea, draw: e.target.checked })} 
        />
          Show Boundingbox
        </div>
      <div>OnPress 
        <div>
          <input type="radio" />
          External handler
          <input type="text" />
        </div>
      </div>
    </div>
  );

  function render() {
    debugger
    let app = new AppBase();
    app.item = pil.Item;
    app.mount(canvas.current).then(() => {
      app.paint();
    })
  }

  return (
    <div className="app">
      <div className="states">
        States
        {states}
      </div>
      <div className="canvas">
        <canvas width="1600" height="1200" ref={canvas}></canvas>
      </div>
      <div className="settings">
        Settings
        {settings}
        <div>Images</div>
        {images}
        <div>MouseArea</div>
        {mouseArea}
        <button onClick={render}>Render</button>
      </div>
    </div>
  );
}

export default App;
