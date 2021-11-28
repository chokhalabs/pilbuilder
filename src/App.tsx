import React, { useRef, useState, useEffect } from "react";
import './App.css';
import { assertNever, IdObj, ItemNode, PilNode, PropertyChange, TextEditNode } from "./pilBase";
import { AppBase, isStateFulNode } from "./pilBase";
import Settings from "./Settings";

function App() {
  const canvas = useRef(null);
  
  const [zoom, setZoom] = useState(1);
  const [selectedNode, selectNode] = useState("myButton_Symbol");
  const [pil, _setPil] = useState<PilNode>({
      id: "root",
      type: "Item",
      draw: false,
      x: 0,
      y: 0,
      height: 100,
      width: 100,
      images: [],
      state: "default",
      states: [
        {
          name: "default",
          when: "true",
          propertyChanges: []
        }
      ],
      mouseArea: {
        id: "mouseArea",
        x: 0,
        y: 0,
        width: 115,
        height: 30,
        hoverEnabled: false,
        mousedown: true,
        mouseup: true,
        draw: false
      },
      children: {
        "textedit": {
          id: "inputelem",
          type: "TextEdit",
          width: 115,
          height: 30,
          x: 0,
          y: 0,
          state: "normal",
          images: [],
          props: {
            value: ""
          },
          currentText: "some text",
          events: {
            onChange: {
              when: "keydown",
              payload: "inputelem.currentText"
            }
          },
          states: [
            {
              name: "inactive",
              when: "esc",
              propertyChanges: [
                {
                  target: "inputelem",
                  currentText: "props.value"
                }
              ]
            },
            {
              name: "active",
              when: "mousedown",
              propertyChanges: []
            }
          ],
          children: null        
        }
      }
  });

  const setPil = function(state: PilNode ) {
    _setPil(state);
  }

  // Just repaint the canvas after every update to the component
  useEffect(() => render());

  function onZoomChange(ev: React.ChangeEvent<HTMLInputElement>) {
    if (ev.target) {
      setZoom(parseFloat(ev.target.value));
    } else {
      console.error("Couldn't set zoom")
    }
  }

  function onNodeUpdate(node: PilNode) {
    // Find the node that is getting updated and update it
    let newPil: PilNode = JSON.parse(JSON.stringify(pil));
    switch (node.type) {
      case "TextEdit":
      case "Item":
        if (isStateFulNode(newPil) && newPil.state !== node.state) {
          newPil.state = node.state;
          newPil = applyPropertyChanges(newPil, node.state);
        } else {
          updateNodeInPil(node, newPil);
        }
        break;
      case "Text":
        updateNodeInPil(node, newPil);
        break;
      default:
        return assertNever(node);
    }
    setPil(newPil);
  }

  function findNodeById(node: IdObj, id: string): null | IdObj {
    if (node.id === id) {
      return node;
    } else if (node.children && node.children[id]) {
      return node.children[id];
    } else {
      const candidateNodes = Object.keys(node).filter(key => typeof node[key] === "object");
      for (let key of candidateNodes) {
        const child = node[key];
        const n = findNodeById(child, id);
        if (n) {
          return n;
        }     
      }
      return null;
    }
  }

  // Should be imported from pilBase
  function applyPropertyChanges(node: ItemNode|TextEditNode, stateName: string) {
    node = JSON.parse(JSON.stringify(node));
    const state = node.states.find(it => it.name === stateName);
    if (state) {
      state.propertyChanges.forEach(pchange => {
        const updateTarget = findNodeById(node, pchange.target);
        if (updateTarget) {
          const propertyKey = Object.keys(pchange).find(key => key !== "target");
          if (propertyKey) {
            updateTarget[propertyKey] = pchange[propertyKey];
          } else {
            console.error("Target not found for property change: ", pchange);
          }
        } else {
          console.error("Update target not found when trying to apply property changes!")
        }
      })
    } else {
      console.error("State not found when applying property changes")
    }
    return node;
  }

  function updateNodeInPil(nodeWithUpdates: PilNode, rootNode: PilNode) {
    switch (nodeWithUpdates.type) {
      case "Text":
        console.error("TextNode cannot have a state and hence propertyChanges");
        break;
      case "Item":
      case "TextEdit":
        calculatePropertyChanges(nodeWithUpdates);
        break;
      default:
        return assertNever(nodeWithUpdates);
    }
    recursiveReplaceNode(nodeWithUpdates, rootNode);
  }

  function recursiveReplaceNode(nodeWithUpdates: PilNode, cursorNode: PilNode) {
    if (nodeWithUpdates.id === cursorNode.id) {
      Object.keys(nodeWithUpdates).forEach(key => {
        // @ts-ignore
        cursorNode[key] = nodeWithUpdates[key];
      });
    } else if (cursorNode.children && cursorNode.children[nodeWithUpdates.id]) {
      cursorNode.children[nodeWithUpdates.id] = nodeWithUpdates;
    } else if (cursorNode.children) {
      Object.values(cursorNode.children).forEach(node => {
        recursiveReplaceNode(nodeWithUpdates, node);
      });
    } else {
      console.info("Search exhausted in subtree");
    }
  }

  function calculatePropertyChanges(nodeWithUpdates: ItemNode | TextEditNode) {
    // Find the node in pil that has the same id which should come out as an ItemNode
    const unUpdatedNode = findNodeInPil(nodeWithUpdates.id, pil) as ItemNode | TextEditNode;

    if (unUpdatedNode) {
      // Find the keys that have been updated
      const updateTargets = getUpdateTargets(nodeWithUpdates, unUpdatedNode);
      for (let propertyChange of updateTargets) {
        addPropertyChange(nodeWithUpdates, propertyChange, unUpdatedNode); 
      }
    } else {
      console.error("Could not find unUpdated node to calculate property changes")
    }
  }

  function addPropertyChange(nodeWithUpdates: ItemNode|TextEditNode, propertyChange: PropertyChange, unUpdatedNode: ItemNode|TextEditNode) {
    for (let i = 0; i < unUpdatedNode.states.length; i++) {
      const state = unUpdatedNode.states[i];
      const propKey = Object.keys(propertyChange).filter(key => key !== 'target')[0];
      const targetExists = state.propertyChanges.filter(propChange => {
        const sameTarget = propChange.target === propertyChange.target;
        const sameValue = propKey && propertyChange[propKey] === propChange[propKey];
        return sameTarget && sameValue;
      }).length > 0;
      if (!targetExists && state.name === nodeWithUpdates.state) {
        nodeWithUpdates.states[i].propertyChanges.push(propertyChange);
      } else if (propKey && !targetExists && state.name !== nodeWithUpdates.state) {
        const n = findNodeById(unUpdatedNode, propertyChange.target);
        if (n) {
          nodeWithUpdates.states[i].propertyChanges.push({
            target: propertyChange.target,
            [propKey]: n[propKey]
          });
        } else {
          console.error("node not found for: ", propertyChange);
        }
      } else {
        console.error("Not adding property change because  this state already has one")
      }
    }
  }

  function getUpdateTargets(nodeWithUpdates: IdObj, unUpdatedNode: IdObj): PropertyChange[] {
    const updateTargets = Object.keys(nodeWithUpdates).map(key => {
      if (nodeWithUpdates[key] && typeof nodeWithUpdates[key] !== 'object' && nodeWithUpdates[key] !== unUpdatedNode[key]) {
        return {
          target: nodeWithUpdates.id,
          [key]: nodeWithUpdates[key]
        };
      } else if ( nodeWithUpdates[key] && typeof nodeWithUpdates[key] === 'object' && !Array.isArray(nodeWithUpdates[key]) ) {
        return getUpdateTargets(nodeWithUpdates[key], unUpdatedNode[key]);
      } else if (nodeWithUpdates[key] && typeof nodeWithUpdates[key] === 'object') { // Its an array with IdObjs
        return nodeWithUpdates[key].map((item: IdObj) => {
          const unUpdatedNodeChild = unUpdatedNode[key].find((it: IdObj) => it.id === item.id);
          if (unUpdatedNodeChild) {
            return getUpdateTargets(item, unUpdatedNodeChild);
          } else {
            return null;
          }
        });
      } 
    });
    return updateTargets.flat(Infinity).filter(it => !!it && !!it.target);
  }

  function findCurrentNode(node: IdObj) {
    if (node.id === selectedNode) {
      return node;
    } else {
      const children: Record<string, IdObj> = node.children || {};
      let childnode: Array<IdObj|null|undefined> = Object.values(children).map(child => {
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

  function findNodeInPil(id: string, cursorNode: IdObj): IdObj | null {
    if (cursorNode.id === id) {
      return cursorNode;
    } else {
      const lookIn = Object.keys(cursorNode).filter(key => typeof cursorNode[key] === "object");
      for (let key of lookIn) {
        if (Array.isArray(cursorNode[key])) {
          const node = cursorNode[key].map((arrItem: IdObj) => findNodeInPil(id, arrItem)).find((it: IdObj | undefined) => !!it);
          if (node) {
            return node;
          }
        } else {
          const node = findNodeInPil(id, cursorNode[key]);
          if (node) {
            return node;
          }
        }
      }
      return null;
    }
  }

  // Find out which node's settings to render and  update the settings bar
  const currentNode: PilNode = findCurrentNode(pil) as PilNode;

  function render() {
    if (canvas.current) {
      let app = new AppBase(canvas.current, pil);
      app.mount();
    } else {
      throw new Error("Could not create app because canvas was not found!")
    }
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

  function downloadProject(uuid: string) {
    console.log("Waiting 5 sec");
    setTimeout(() => {
      console.log("Trying...");
      fetch(`http://localhost:3030/project/${uuid}`)
      .then(res => {
        // @ts-ignore
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
        a.setAttribute("style", "display: none");
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

  const pilTree = (
    <div>
      { renderPilTree(pil) }
    </div>
  );

  function renderPilTree(node: PilNode) {
    const isSelected = node.id === selectedNode;
    return (
      <div>
        <div style={{ color: isSelected ? "cornflowerblue": "white", cursor: "pointer" }} onClick={() => selectNode(node.id)}>{node.type}</div>
        <div style={{marginLeft: 10 }}>
          {node.children ? Object.values(node.children).map(child => renderPilTree(child)) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="states">
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
        { currentNode && 
          <Settings 
            node={currentNode}
            onNodeUpdate={(node: PilNode) => onNodeUpdate(node)}
          />
        }
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
