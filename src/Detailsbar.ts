import { createElement as h } from "react";
import { Config } from "./utils";

type DetailsProps = {
  node: Config | null,
  onNodeUpdate: (key: string, value: any) => void
};

function editNumber(props: { label: string; value: number; onChange: (key: string, value: number) => void, isProvided: boolean }) {
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

function editColor(props: { label: string; value: string; onChange: (key: string, value: string) => void, isProvided: boolean }) {
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

function editText(props: { label: string; value: string; onChange: (key: string, value: string | { expr: string }) => void; isProvided: boolean} ) {
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
          value: props.isProvided ? props.value.substring("$props.".length) : props.value,
          type: "text",
          onChange: ev => props.onChange(props.label, props.isProvided ? { expr: "$props." + ev.target.value } : ev.target.value)
        }
      ),
      h("input", { type: "checkbox", checked: props.isProvided, onChange: ev => {
        if (ev.target.checked) {
          props.onChange(props.label, { expr: "$props." + props.value })
        } else {
          props.onChange(props.label, props.value)
        }
      } })
    ] 
  );
}

export default function (props: DetailsProps) {
  let body = h("div", {}, "Select a node to edit its properties!");
  if (props.node) {
    const node = props.node;
    let propEditors: Array<ReturnType<typeof h>> = [];

    if (node.props) {
      Object.keys(node.props).forEach(propkey => {
        const propval = node.props && node.props[propkey];
        if (propkey === "fill") {
          propEditors.push(editColor({ 
            label: propkey, 
            value: propval as string, // fill is always string
            onChange: props.onNodeUpdate,
            isProvided: false
          }));
        } else if (typeof propval === "number") {
          propEditors.push(editNumber({
            label: propkey,
            value: propval,
            onChange: props.onNodeUpdate,
            isProvided: false
          }));
        } else if (typeof propval === "string") {
          propEditors.push(editText({
            label: propkey,
            value: propval,
            onChange: props.onNodeUpdate,
            isProvided: false
          }));
        } else if (typeof propval === "object" && propval) {
          propEditors.push(editText({
            label: propkey,
            value: propval.expr,
            onChange: props.onNodeUpdate,
            isProvided: true
          }));
        }
      })
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