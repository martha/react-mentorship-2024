import { FormProvider, useForm, useWatch, Control, useFormContext, useFormState } from 'react-hook-form'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { cloneDeep } from 'lodash-es';
import { v4 } from 'uuid';
import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react';
import FormTreeItem from './FormTreeItem';
import React from 'react';
import { Box, Button } from '@mui/material';
import { getItemMap, getRhfPathMap } from './useUpdateFormStructure';

export interface ItemType {
  id: string;
  children?: ItemType[];
}

export default function FormBuilder() {
  const rhfMethods = useForm<ItemType>({
    defaultValues: {
      children: [{
        id: 'A',
        children: [
          {
            id: 'B',
            children: [
              {
                id: 'C',
              },
              {
                id: 'D',
              },
              {
                id: 'E',
              },
            ]
          },
          {
            id: 'F',
          },
          {
            id: 'G',
            children: [
              {
                id: 'H',
              },
              {
                id: 'I',
              },
            ]
          },
          {
            id: 'J',
            children: [
              {
                id: 'K',
              },
            ]
          }
        ]
      }]
    },
  });

  const onSubmit = (data) => console.log(data);

  return <FormProvider {...rhfMethods}>
    <form onSubmit={rhfMethods.handleSubmit(onSubmit)}>
      <FormTree/>
      <Button type='submit'>Log data</Button>
    </form>
  </FormProvider>
}

const DEFAULT_EXPANDED_ITEMS = ['A'];

const FormTree = () => {
  const { control } = useFormContext();
  const values = useWatch({ control });

  const rhfPathMap = getRhfPathMap(values.children);
  const itemMap = useMemo(
    () => getItemMap(values as ItemType),
    [values]
  );

  const [expandedItems, setExpandedItems] = React.useState<string[]>(DEFAULT_EXPANDED_ITEMS);
  const handleExpandedItemsChange = (
    event: React.SyntheticEvent,
    itemIds: string[]
  ) => {
    setExpandedItems(itemIds);
  };

  return <FormTreeContext.Provider value={{
    rhfPathMap,
    itemMap,
    expandItem: (itemId: string) =>
      setExpandedItems((prev) => [...prev, itemId]),
  }}>
    <RichTreeView
      items={values.children}
      getItemLabel={(item: ItemType) => item.id}
      slots={{ item: FormTreeItem }}
      expandedItems={expandedItems}
      onExpandedItemsChange={handleExpandedItemsChange}
      disableSelection
    />
  </FormTreeContext.Provider>
}

export const FormTreeContext = React.createContext<{
  rhfPathMap: Record<string, string>;
  itemMap: Record<string, ItemType>;
  expandItem: (itemId: string) => void;
}>({
  rhfPathMap: {},
  itemMap: {},
  expandItem: (itemId: string) => {},
});
