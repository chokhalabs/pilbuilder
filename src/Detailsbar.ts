import { createElement as h } from "react";
import { Config } from "./utils";

type DetailsProps = {
  node: Config | null,
  onNodeUpdate: (key: string, value: any) => void
};

function editNumber(props: { label: string; value: number; onChange: (key: string, value: number) => void }) {
  return h(
    "div", 
    {
      className: "numberfield"
    },
    [
      h(
        "div",
        {},
        props.label
      ),
      h(
        "input",
        {
          value: props.value,
          type: "number",
          onChange: ev => props.onChange(props.label, parseFloat(ev.target.value))
        }
      )
    ] 
  );
}

function editColor(props: { label: string; value: string; onChange: (key: string, value: string) => void }) {
  return h(
    "div", 
    {
      className: "colorfield"
    },
    [
      h(
        "div",
        {},
        props.label
      ),
      h(
        "input",
        {
          value: props.value,
          type: "color",
          onChange: ev => props.onChange( props.label, ev.target.value)
        }
      )
    ] 
  );
}

function editText(props: { label: string; value: string; onChange: (key: string, value: string) => void }) {
  return h(
    "div", 
    {
      className: "textfield"
    },
    [
      h(
        "div",
        {},
        props.label
      ),
      h(
        "input",
        {
          value: props.value,
          type: "text",
          onChange: ev => props.onChange( props.label, ev.target.value)
        }
      )
    ] 
  );
}

export default function (props: DetailsProps) {
  let body = h("div", {}, "Select a node to edit its properties!");
  if (props.node) {
    const node = props.node;
    let propEditors = [];

    let x = node.props?.x;
    if (typeof x === "number") {
      propEditors.push(editNumber({ 
        label: "x", 
        value: x,
        onChange: props.onNodeUpdate
      }));
    }

    let y = node.props?.y;
    if (typeof y === "number") {
      propEditors.push(editNumber({ 
        label: "y", 
        value: y,
        onChange: props.onNodeUpdate
      }));
    }

    let width = node.props?.width;
    if (typeof width === "number") {
      propEditors.push(editNumber({ 
        label: "width", 
        value: width,
        onChange: props.onNodeUpdate
      }));
    }

    let height = node.props?.height;
    if (typeof height === "number") {
      propEditors.push(editNumber({ 
        label: "height", 
        value: height,
        onChange: props.onNodeUpdate
      }));
    }

    let fill = node.props?.fill;
    if (typeof fill === "string") {
      propEditors.push(editColor({ 
        label: "fill", 
        value: fill,
        onChange: props.onNodeUpdate
      }));
    }

    let text = node.props?.text;
    if (typeof text === "string") {
      propEditors.push(editText({ 
        label: "text", 
        value: text,
        onChange: props.onNodeUpdate
      }));
    }

    body = h(
      "div",
      {},
      propEditors
    )
  }

  return h(
    "div",
    {
      className: "detailsbar"
    },
    body 
  );
}