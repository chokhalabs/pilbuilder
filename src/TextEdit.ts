import { TextEditNode } from "./pilBase";

function keyDownHandler(ev: KeyboardEvent, node: TextEditNode, onNodeUpdate: (node: TextEditNode) => void) {
  let newText = node.currentText;
  if (ev.key === "Backspace" || ev.key === "Delete") {
    newText = newText.slice(0, -1); 
  } else {
    newText = node.currentText + ev.key;
  }

  onNodeUpdate({
    ...node,
    currentText: newText
  });
}

const listenersRefs: Record<string, any> = {};

export function onActive(node: TextEditNode, onNodeUpdate: (node: TextEditNode) => void) {
  const listener = (ev: KeyboardEvent) => {
    keyDownHandler(ev, node, onNodeUpdate);
  };
  if (listenersRefs[node.id]) {
    document.removeEventListener("keydown", listenersRefs[node.id]);
  }
  listenersRefs[node.id] = listener;
  document.addEventListener("keydown", listener);
}

export function onInactive(node: TextEditNode) {
  document.removeEventListener("keydown", listenersRefs[node.id]);
}