import { FormProvider, useForm, useWatch, Control, useFormContext, useFormState } from 'react-hook-form'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { cloneDeep } from 'lodash-es';
import { v4 } from 'uuid';
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import FormTreeItem from './FormTreeItem';
import React from 'react';
import { Box, Button } from '@mui/material';
import { getRhfPathMap } from './useUpdateFormStructure';

export interface ItemType {
  id: string;
  children?: ItemType[];
}

export default function FormBuilder() {
  const rhfMethods = useForm<ItemType>({
    defaultValues: {
      children: [{
        id: '53ac568f-0dd9-499e-8a2c-b853c73b0644',
        children: [
          {
            id: '96625994-8345-4a12-8e6d-c7997e6a6684',
          },
          {
            id: 'b2185e93-0736-4c01-8841-7878d602fb40',
          }
        ]
      }]
    },
  });

  const onSubmit = (data) => console.log(data);

  return <FormProvider {...rhfMethods}>
    <form
        onSubmit={rhfMethods.handleSubmit(onSubmit)}
      >
      <FormTree/>
      <Button type='submit'>Log data</Button>
    </form>
  </FormProvider>
}

const FormTree = () => {
  const { control } = useFormContext();
  const values = useWatch({ control });

  const rhfPathMap = getRhfPathMap(values.children);

  return <FormTreeContext.Provider value={{rhfPathMap}}>
    <RichTreeView
      items={values.children}
      getItemLabel={(item: ItemType) => item.id}
      slots={{ item: FormTreeItem }}
      disableSelection
    />
  </FormTreeContext.Provider>
}

export const FormTreeContext = React.createContext<{
  rhfPathMap: Record<string, string>;
}>({
  rhfPathMap: {},
});
