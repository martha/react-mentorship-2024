import * as React from "react";
import Box from "@mui/material/Box";
import {
  TreeItem2,
  TreeItem2Content,
  TreeItem2Label,
  TreeItem2Props,
} from "@mui/x-tree-view/TreeItem2";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeViewBaseItem } from "@mui/x-tree-view/models";
import { Reducer, useState } from "react";
import { Divider, Stack } from "@mui/material";
import { inherits } from "util";

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

function CustomContent({itemId, onMove, children, ...props}) {
  const [dragOverLocation, setDragOverLocation] = useState(null);

  return (
    <TreeItem2Content
      {...props}
      sx={{width: '100%'}}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("draggedItemId", itemId);
      }}
      onDrop={(event) => {
        // console.log('target of drop', itemId);
        // console.log('dragged item', )
        event.preventDefault();
        onMove(event.dataTransfer.getData('draggedItemId'), itemId, dragOverLocation);
      }}
      onDragOver={(event) => {
        const rect = event.target.getBoundingClientRect();
        const pos = event.clientY - rect.y
        const height = rect.height

        if (pos < height / 4) {
          setDragOverLocation('top')
          // above
        } else if (pos > 3 * height / 4) {
          setDragOverLocation('bottom')
          // below
        } else {
          setDragOverLocation('middle')
          // child
        }

        event.preventDefault();
      }}
      onDragLeave={(event) => {
        setDragOverLocation(null)
      }}
    >
      <Stack direction='column'>
      <Box width="10px" height="10px" sx={{backgroundColor: dragOverLocation === 'top' ? 'grey' : 'inherit'}}/>
      <Box sx={{backgroundColor: dragOverLocation === 'middle' ? 'grey' : 'inherit'}}>
        {children}
      </Box>
      <Box width="10px" height="10px" sx={{backgroundColor: dragOverLocation === 'bottom' ? 'grey' : 'inherit'}}/>
      </Stack>
    </TreeItem2Content>
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
    const onMove = (itemToMoveId, targetItemId, dragOverLocation) => {
      switch (dragOverLocation) {
        case 'top':
          return dispatch({ type: "MOVE_ABOVE", itemToMoveId, targetItemId })
        case 'middle':
          return dispatch({ type: "MOVE_TO_CHILD", itemToMoveId, targetItemId })
        case 'bottom':
          return dispatch({ type: "MOVE_BELOW", itemToMoveId, targetItemId })
      }
    }

    return (
      <TreeItem2
        draggable
        ref={ref}
        {...props}
        slots={{
          label: CustomLabel,
          content: CustomContent,
        }}
        slotProps={{
          label: {
            onClickRemove,  // todo - how to make typescript happy?
          },
          content: {
            itemId: props.itemId,
            onMove
          }
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
  if (action.type === "MOVE_ABOVE") {
    const itemToMove = state.find((product) => product.id === action.itemToMoveId);
    const indexToSplice = state.findIndex((product) => product.id === action.targetItemId);
    const newState = state.filter((product) => product.id !== action.itemToMoveId);
    newState.splice(indexToSplice, 0, itemToMove);
    return newState;
  }
  if (action.type === "MOVE_TO_CHILD") {
    const itemToMove = state.find((product) => product.id === action.itemToMoveId);

    // todo @martha - does not work recursively
    return state
      .filter((product) => product.id !== action.itemToMoveId)
      .map((product) => {
        if (product.id === action.targetItemId) {
          console.log(product);
          return {
            ...product,
            children: [...product.children, itemToMove]
          }
        } else {
          return product;
        }
      })
  }
  if (action.type === "MOVE_BELOW") {
    const itemToMove = state.find((product) => product.id === action.itemToMoveId);
    const indexToSplice = state.findIndex((product) => product.id === action.targetItemId) + 1
    const newState = state.filter((product) => product.id !== action.itemToMoveId);
    newState.splice(indexToSplice, 0, itemToMove);
    return newState;
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