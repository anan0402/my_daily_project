import { forwardRef, useMemo, useState } from "react";

import TextField from "@mui/material/TextField";
import { Virtuoso } from "react-virtuoso";

/**
 * Atom: select box with virtualized menu items for large option lists.
 * Supports flat or hierarchical option trees.
 *
 * Flat option shape:
 * - { label, value, disabled }
 *
 * Hierarchical option shape:
 * - { label, value, disabled, children: [...] }
 */
const InfinitySelectBox = forwardRef(function InfinitySelectBox(
  {
    value = "",
    onChange,
    label,
    placeholder = "Select an option",
    helperText,
    error = false,
    fullWidth = true,
    size = "medium",
    disabled = false,
    entities = {},
    childrenMap = {},
    rootIds = [],
    onLoadRoot,
    onLoadChildren,
    ...props
  },
  ref,
) {
  const [open, setOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());
  


  const toggle = async (id) => {
    if (!childrenMap[id]) {
      await onLoadChildren?.(id);
    }

    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const visibleList = useMemo(() => {
    const result = [];

    function dfs(ids, level = 0) {
      for (const id of ids) {
        const node = entities[id];

        result.push({
          id,
          level,
          label: node?.name ?? "",
        });

        if (expandedIds.has(id)) {
          dfs(childrenMap[id] || [], level + 1);
        }
      }
    }

    dfs(rootIds);
    return result;
  }, [rootIds, expandedIds, childrenMap, entities]);

  const Row = ({ item }) => {
    const node = entities[item.id];

    return (
      <div style={{ paddingLeft: item.level * 16 }}>
        {node?.hasChildren && (
          <span onClick={() => toggle(item.id)}>
            {expandedIds.has(item.id) ? "▼" : "▶"}
          </span>
        )}
        {item.label}
      </div>
    );
  };


  return (
    <TextField
      {...props}
      ref={ref}
      select
      fullWidth={fullWidth}
      size={size}
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      disabled={disabled}
      slotProps={{
        select: {
          open,
          onOpen: async () => {
            setOpen(true);
            if (!rootIds.length) {
              await onLoadRoot?.();
            }
          },
          onClose: () => setOpen(false),
          displayEmpty: true,
          renderValue: (selected) => {
            if (
              selected === "" ||
              selected === null ||
              selected === undefined
            ) {
              return <span style={{ opacity: 0.5 }}>{placeholder}</span>;
            }

            if (typeof selected === "object") {
              return selected.label ?? placeholder;
            }

            return entities[selected]?.name ?? placeholder;
          },
          MenuProps: {
            PaperProps: {
              sx: {
                maxHeight: 360,
                overflow: "hidden",
              },
            },
            MenuListProps: {
              disablePadding: true,
            },
          },
        },
      }}
    >
      <Virtuoso
        style={{ height: 300 }}
        data={visibleList}
        endReached={() => {
          onLoadRoot?.();
        }}
        itemContent={(_, item) => <Row item={item} />}
      />
    </TextField>
  );
});

export default InfinitySelectBox;
