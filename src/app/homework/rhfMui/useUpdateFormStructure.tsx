import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { Control, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ItemType } from "./FormTree";
import { get, set } from 'lodash-es';

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

export type ItemMap = Record<string, ItemType>;
export const getItemMap = (
  definition: ItemType,
  preserveNestedItems = true
) => {
  const allItems: ItemMap = {};

  // Recursive helper for traversing the FormDefinition
  function rescursiveFillMap(items: ItemType[], itemMap: ItemMap) {
    items.forEach((item: ItemType) => {
      const { children, ...rest } = item;
      if (preserveNestedItems) {
        itemMap[item.id] = item;
      } else {
        itemMap[item.id] = rest;
      }
      if (Array.isArray(children)) {
        rescursiveFillMap(children, itemMap);
      }
    });
  }

  rescursiveFillMap([definition], allItems);

  return allItems;
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

export const removeItemFromDefinition = ({
  removeFromPath,
  removeFromIndex,
  definition,
}: {
  removeFromPath: string;
  removeFromIndex: number;

  definition: ItemType;
}) => {
  // Get the array
  const oldParentArray = get(definition, removeFromPath);
  // Drop the item at the specified index
  const itemRemoved = oldParentArray.splice(removeFromIndex, 1)[0];

  return itemRemoved;
};

export const insertItemToDefinition = ({
  insertPath,
  insertAtIndex,
  definition,
  item,
}: {
  insertPath: string;
  insertAtIndex: number;
  definition: ItemType;
  item?: ItemType;
}) => {
  // Get the array
  const newParentArray = get(definition, insertPath);
  if (!newParentArray) {
    // If array doesn't exist, this might be a new Group item that doesn't have children yet.
    // Raise unless its a Group item.
    const parentItem = get(definition, insertPath.replace(/\.item$/, ''));
    if (!parentItem) {
      console.log(insertPath, insertAtIndex, definition, item);
      throw new Error('Cannot find parent');
    }
    console.log(definition, insertPath, item)
    // Insert the item into a new array
    set(definition, insertPath, [item]);
  } else {
    // Insert the item
    newParentArray.splice(insertAtIndex, 0, item);
  }
};

const MAX_NESTING_DEPTH = 3;

export default function useUpdateFormStructure(
  control: Control,
  itemId: string,
  rhfPathMap: Record<string, string>,
  item: ItemType,
  expandItem: (itemId: string) => void
) {
  const values = useWatch({ control });
  const { reset } = useFormContext();

  // Example:
  // itemPath:              item.3.item.1
  // parentArrayPath:       item.3.item (thisIndex=1)
  // grandParentArrayPath:  item        (parentIndex=3)

  const itemPath = rhfPathMap[itemId];
  const {
    parentPath: parentArrayPath,
    index: thisIndex,
    nestingDepth,
  } = getPathContext(itemPath);
  const parentItemId = parentArrayPath.replace(/\.children$/, '');
  const { parentPath: grandParentArrayPath, index: parentIndex } =
    getPathContext(parentItemId);

  // RHF swap is used for swapping items within an array
  const { swap, remove } = useFieldArray({ control, name: parentArrayPath });

  const thisLayer = get(values, parentArrayPath);
  // `thisLayer` could be undefined if an item was just deleted. https://github.com/greenriver/hmis-frontend/pull/821#issue-2371078251

  const hasParent = parentIndex !== -1;

  const canMoveDown = useMemo(() => {
    const hasSiblingBelow = thisLayer ? !!thisLayer[thisIndex + 1] : false;
    return hasSiblingBelow || hasParent;
  }, [hasParent, thisIndex, thisLayer]);

  const canMoveUp = useMemo(() => {
    const hasSiblingAbove = thisIndex > 0;
    return hasSiblingAbove || hasParent;
  }, [hasParent, thisIndex]);


  const onDelete = useCallback(() => {
    remove(thisIndex);
  }, [remove, thisIndex]);

  // This restriction prevents nesting a Group beyond MAX_NESTING_DEPTH - 1.
  // This way regular (non-group) items can't ever be nested beyond MAX_NESTING_DEPTH.
  const isMaxDepth = useMemo(
    () =>
      nestingDepth === MAX_NESTING_DEPTH - 1,
    [nestingDepth]
  );

  const onReorder = useCallback(
    (direction: 'up' | 'down') => {
      if (!thisLayer) return;

      if (direction === 'up') {
        // If index > 0, we can move this item up within its existing "layer"
        if (thisIndex > 0) {
          const prevItem = thisLayer[thisIndex - 1]; // sibling above current item
          if (!isMaxDepth) {
            // CASE 1: If the item above it is a group, we remove this item and
            // append it to the "sibling" group above it, as long as we haven't reached max depth
            const prevLinkId = prevItem.id;
            const prevItemPath = rhfPathMap[prevLinkId] + '.item';

            expandItem(prevLinkId); // expand the group it's moving into
            reset(
              (oldForm) => {
                removeItemFromDefinition({
                  removeFromPath: parentArrayPath,
                  removeFromIndex: thisIndex,
                  definition: oldForm as ItemType,
                });
                insertItemToDefinition({
                  insertPath: prevItemPath,
                  insertAtIndex: get(oldForm, prevItemPath)?.length || 0,
                  definition: oldForm as ItemType,
                  item,
                });
                return oldForm;
              },
              { keepDefaultValues: true }
            );
          } else {
            // CASE 2: Swap this item with the item above it
            swap(thisIndex, thisIndex - 1);
          }
        } else if (hasParent) {
          // CASE 3: This item is the first item in its group, so we need to move it "out"
          // of its group and insert it into its parent array.

          reset(
            (oldForm) => {
              removeItemFromDefinition({
                removeFromPath: parentArrayPath,
                removeFromIndex: 0,
                definition: oldForm as ItemType,
              });
              insertItemToDefinition({
                insertPath: grandParentArrayPath,
                insertAtIndex: parentIndex,
                definition: oldForm as ItemType,
                item,
              });
              return oldForm;
            },
            { keepDefaultValues: true }
          );

          // else, this is the first item in the top layer, so no action can be taken
        }
      } else if (direction === 'down') {
        const nextItem = thisLayer[thisIndex + 1]; // sibling below current item

        if (nextItem) {
          if (!isMaxDepth) {
            // CASE 4: If the item below it is a group, we remove this item and
            // prepend it to the "sibling" group below it, as long as we haven't reached max depth
            const nextLinkId = nextItem.id;
            const nextItemPath = rhfPathMap[nextLinkId] + '.item';
            console.log(nextLinkId);
            console.log(rhfPathMap);

            expandItem(nextLinkId); // expand the group it's moving into
            reset(
              (oldForm) => {
                insertItemToDefinition({
                  insertPath: nextItemPath,
                  insertAtIndex: 0, // prepend to sibling below
                  definition: oldForm as ItemType,
                  item,
                });
                removeItemFromDefinition({
                  removeFromPath: parentArrayPath,
                  removeFromIndex: thisIndex,
                  definition: oldForm as ItemType,
                });
                return oldForm;
              },
              { keepDefaultValues: true }
            );
          } else {
            // CASE 5: Swap this item with the item below it
            swap(thisIndex, thisIndex + 1);
          }
        } else {
          if (hasParent) {
            // CASE 6: This is the last item at this depth. Move into the parent layer

            reset(
              (oldForm) => {
                insertItemToDefinition({
                  insertPath: grandParentArrayPath,
                  insertAtIndex: parentIndex + 1,
                  definition: oldForm as ItemType,
                  item,
                });
                removeItemFromDefinition({
                  removeFromPath: parentArrayPath,
                  removeFromIndex: get(oldForm, parentArrayPath).length - 1, // remove the last item
                  definition: oldForm as ItemType,
                });
                return oldForm;
              },
              { keepDefaultValues: true }
            );
          } // else, this is the last item in the top layer, so no action can be taken
        }
      }
    },
    [thisLayer, thisIndex, hasParent, isMaxDepth, rhfPathMap, expandItem, reset, parentArrayPath, item, swap, grandParentArrayPath, parentIndex]
  );

  return { onReorder, onDelete, itemPath, canMoveUp, canMoveDown };
}
