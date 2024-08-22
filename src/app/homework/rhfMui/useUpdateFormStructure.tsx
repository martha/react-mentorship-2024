import { useCallback } from "react";
import { Control, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ItemType } from "./FormTree";
import { get } from 'lodash-es';

export default function useUpdateFormStructure(
  control: Control,
  itemId: string,
  rhfPathMap: Record<string, string>,
) {
  const itemPath = rhfPathMap[itemId];
  if (!itemPath) {
    console.log('reproduced the problem')
    console.log('itemId', itemId)
    console.log('itemPath', itemPath)
    console.log('rhfPathMap', rhfPathMap);
    // item not present in rhfPathMap, but it is still trying to render
  }

  const {
    parentPath: parentArrayPath,
    index: thisIndex,
    nestingDepth,
  } = getPathContext(itemPath);

  const values = useWatch({ control });

  const { remove } = useFieldArray({ control, name: parentArrayPath });

  const onDelete = useCallback(() => {
    remove(thisIndex);
  }, [remove, thisIndex]);

  return { onDelete };
}

export const getRhfPathMap = (items: ItemType[]) => {
  const map: Record<string, string> = {};

  function recursiveMap(
    items : ItemType[] | undefined,
    parentKey: string
  ) {
    items?.forEach((item, i) => {
      const key = `${parentKey && parentKey + '.'}${i}`;

      map[item.id] = key;
      recursiveMap(item.children, key + '.children');
    });
  }

  recursiveMap(items, 'children');
  return map;
};

export const getPathContext = (
  itemPath: string
): { parentPath: string; index: number; nestingDepth: number } => {
  if (!itemPath || itemPath === 'children') {
    return { parentPath: '', index: -1, nestingDepth: 0 };
  }

  const components = itemPath.split('.');
  const lastComponent = components[components.length - 1];

  if (lastComponent === 'children') {
    throw new Error(
      '`getPathContext` accepts an item path, such as `children.0.children.1`. It should end in an index, not `children`.'
    );
  }

  // calculate the nesting depth by how many times 'children' appears in the path
  const nestingDepth = components.filter((c) => c === 'children').length;

  const index = components.pop();
  return {
    parentPath: components.join('.'),
    index: Number(index),
    nestingDepth: nestingDepth,
  };
};