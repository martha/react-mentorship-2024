import * as React from "react";
import Box from "@mui/material/Box";
import {
  TreeItem2,
  TreeItem2Label,
  TreeItem2Props,
} from "@mui/x-tree-view/TreeItem2";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeViewBaseItem } from "@mui/x-tree-view/models";
import { Reducer } from "react";

interface CustomLabelProps {
  children: string;
  className: string;
  onClickRemove: () => void;
}

function CustomLabel(props: CustomLabelProps) {
  const { children, onClickRemove, ...other } = props;

  return (
    <TreeItem2Label {...other}>
      {children}
      <button style={{ marginLeft: 10 }} onClick={onClickRemove}>
        Remove
      </button>
    </TreeItem2Label>
  );
}

const CustomTreeItem = React.forwardRef(function CustomTreeItem(
  props: TreeItem2Props,
  ref: React.Ref<HTMLLIElement>
) {
    const dispatch = React.useContext(TreeItemDispatchContext);
    const onClickRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      dispatch({ type: "DELETE", itemId: props.itemId });
    };

    return (
      <TreeItem2
        ref={ref}
        {...props}
        slots={{
          label: CustomLabel,
        }}
        slotProps={{
          label: {
            onClickRemove,  // todo - how to make typescript happy?
          },
        }}
      />
    );
  }
);

const DEFAULT_MUI_X_PRODUCTS: TreeViewBaseItem[] = [
  {
    id: "grid",
    label: "Data Grid",
    children: [
      { id: "grid-community", label: "@mui/x-data-grid" },
      { id: "grid-pro", label: "@mui/x-data-grid-pro" },
      { id: "grid-premium", label: "@mui/x-data-grid-premium" },
    ],
  },
  {
    id: "pickers",
    label: "Date and Time Pickers",
    children: [
      { id: "pickers-community", label: "@mui/x-date-pickers" },
      { id: "pickers-pro", label: "@mui/x-date-pickers-pro" },
    ],
  },
  {
    id: "charts",
    label: "Charts",
    children: [{ id: "charts-community", label: "@mui/x-charts" }],
  },
  {
    id: "tree-view",
    label: "Tree View",
    children: [{ id: "tree-view-community", label: "@mui/x-tree-view" }],
  },
];

const DEFAULT_EXPANDED_ITEMS = ["pickers"];

const reducer: Reducer<TreeViewBaseItem[], any> = (state, action) => {
  if (action.type === "DELETE") {
    return state
      .filter((product) => product.id !== action.itemId)
      .map((product) => ({
        ...product,
        children: product.children?.filter(
          (child) => child.id !== action.itemId
        ),
      }));
  }
  throw Error("Unknown action.");
}

const TreeItemDispatchContext = React.createContext<any>(null);

export default function ReducerFormTree() {
  const [products, dispatch] = React.useReducer(
    reducer,
    DEFAULT_MUI_X_PRODUCTS
  );

  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <TreeItemDispatchContext.Provider value={dispatch}>
        <RichTreeView
          items={products}
          aria-label="customized"
          defaultExpandedItems={DEFAULT_EXPANDED_ITEMS}
          slots={{ item: CustomTreeItem }}
        />
      </TreeItemDispatchContext.Provider>
    </Box>
  );
}