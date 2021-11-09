import { useRef, useState } from "react";
import './App.css';
import { AppBase } from "./pilBase";

function App() {
  const canvas = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pil, _setPil] = useState({
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
        "id": "mouseArea",
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
          "when": "mouseup",
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
          "when": "mousedown",
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
    setTimeout(() => {
      let app = new AppBase();
      app.item = pil.Item;
      app.mount(canvas.current).then(() => {
        app.paint();
      }) 
    })
  }

  return (
    <div className="app">
      <div className="states">
        States
        {states}
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
        <div>Images</div>
        {images}
        <div>MouseArea</div>
        {mouseArea}
        <input 
          type="range" 
          value={zoom} 
          onChange={ev => onZoomChange(ev)} 
          min="0.2"
          max="1"
          step="0.1"
        />
        <button onClick={render}>Render</button>
      </div>
    </div>
  );
}

export default App;
