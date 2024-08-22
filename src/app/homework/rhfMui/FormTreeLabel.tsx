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
  const { rhfPathMap } = useContext(FormTreeContext);

  const { onDelete } = useUpdateFormStructure(
    control,
    itemId,
    rhfPathMap
  );

  return <TreeItem2Label key={id}>
    {labelProps.children}{'  '}
    <Button onClick={(e) => {
      e.stopPropagation();
      onDelete();
    }}>Delete</Button>
  </TreeItem2Label>
}
