import { TreeItem2Label } from "@mui/x-tree-view";
import { useTreeItem2 } from "@mui/x-tree-view/useTreeItem2/useTreeItem2";
import { UseTreeItem2LabelSlotProps, UseTreeItem2Parameters } from "@mui/x-tree-view/useTreeItem2/useTreeItem2.types";
import { useFormContext } from "react-hook-form";
import { FormTreeContext } from "./FormTree";
import { useContext } from "react";
import { Button } from "@mui/material";
import useUpdateFormStructure from "./useUpdateFormStructure";

export interface FormTreeLabelProps
  extends UseTreeItem2LabelSlotProps,
    Omit<UseTreeItem2Parameters, 'children'> {
  itemId: string;
}

export default function FormTreeLabel({
  id,
  itemId,
  label,
  children,
}: FormTreeLabelProps) {

  const { getLabelProps } = useTreeItem2({
    id,
    itemId,
    children,
    label,
  });

  const labelProps = getLabelProps();

  const { control } = useFormContext();
  const { rhfPathMap, expandItem, itemMap } = useContext(FormTreeContext);

  const { onReorder, onDelete, itemPath, canMoveUp, canMoveDown } = useUpdateFormStructure(
    control,
    itemId,
    rhfPathMap,
    itemMap[itemId],
    expandItem,
  );

  return <TreeItem2Label key={id}>
    {labelProps.children}{'  '}
    <Button onClick={(e) => {
      e.stopPropagation();
      onDelete();
    }}>Delete</Button>
    <Button disabled={!canMoveUp} onClick={(e) => {
      e.stopPropagation();
      onReorder('up');
    }}>Up</Button>
    <Button disabled={!canMoveDown} onClick={(e) => {
      e.stopPropagation();
      onReorder('down');
    }}>Down</Button>
  </TreeItem2Label>
}
