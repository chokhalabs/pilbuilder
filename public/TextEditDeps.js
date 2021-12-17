function keyDownHandler(ev, node, onNodePropertyUpdate) {
  ev.preventDefault();
  let newText = node.currentEditedText;
  if (ev.key === "Backspace" || ev.key === "Delete") {
    newText = newText.slice(0, -1); 
  } else if (ev.key === "Control" || ev.key === "Shift" || ev.key === "Alt") {
    console.info("Ignoring ", ev.key);
  } else {
    newText = node.currentEditedText + ev.key;
  }

  onNodePropertyUpdate("currentEditedText", newText);
}

const listenersRefs = {};

export function onActive(node, onNodePropertyUpdate) {
  onNodePropertyUpdate("currentEditedText", node.value);
  const listener = (ev) => {
    keyDownHandler(ev, node, onNodePropertyUpdate);
  };
  if (listenersRefs[node.id]) {
    document.removeEventListener("keydown", listenersRefs[node.id]);
  }
  listenersRefs[node.id] = listener;
  document.addEventListener("keydown", listener);
}

export function onInactive(node) {
  document.removeEventListener("keydown", listenersRefs[node.id]);
}
