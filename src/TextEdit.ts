import { TextEditNode } from "./pilBase";

function keyDownHandler(ev: KeyboardEvent, node: TextEditNode, onNodePropertyUpdate: (node: TextEditNode, key: string) => void) {
  ev.preventDefault();
  let newText = node.currentText;
  if (ev.key === "Backspace" || ev.key === "Delete") {
    newText = newText.slice(0, -1); 
  } else if (ev.key === "Control" || ev.key === "Shift" || ev.key === "Alt") {
    console.info("Ignoring ", ev.key);
  } else {
    newText = node.currentText + ev.key;
  }

  onNodePropertyUpdate({
    ...node,
    currentText: newText
  }, "currentText");
}

const listenersRefs: Record<string, any> = {};

export function onActive(node: TextEditNode, onNodePropertyUpdate: (node: TextEditNode, key: string) => void) {
  const listener = (ev: KeyboardEvent) => {
    keyDownHandler(ev, node, onNodePropertyUpdate);
  };
  if (listenersRefs[node.id]) {
    document.removeEventListener("keydown", listenersRefs[node.id]);
  }
  listenersRefs[node.id] = listener;
  document.addEventListener("keydown", listener);
}

export function onInactive(node: TextEditNode, onNodePropertyUpdate: (node: TextEditNode, key: string) => void) {
  document.removeEventListener("keydown", listenersRefs[node.id]);
}
