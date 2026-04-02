import React, { useState } from "react";

export function FiltersSidebar({ title, groups = [] }) {
  const [collapsed, setCollapsed] = useState(() => {
    const initial = {};
    groups.forEach((g) => {
      initial[g.name] = false;
    });
    return initial;
  });
  const [checked, setChecked] = useState(() => {
    const initial = {};
    groups.forEach((g) => {
      (g.options || []).forEach((opt) => {
        initial[g.name + ":" + opt] = false;
      });
    });
    return initial;
  });

  function toggleCollapse(groupName) {
    setCollapsed((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  }

  function toggleCheck(key) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <aside className="filters-sidebar">
      {title && <h3 className="filters-sidebar-title">{title}</h3>}
      {groups.map((group) => (
        <div className="filters-sidebar-group" key={group.name}>
          <button
            className="filters-sidebar-group-header"
            type="button"
            onClick={() => toggleCollapse(group.name)}
          >
            <span className="filters-sidebar-group-name">{group.name}</span>
            <span className="filters-sidebar-group-toggle">
              {collapsed[group.name] ? "+" : "\u2212"}
            </span>
          </button>
          {!collapsed[group.name] && (
            <div className="filters-sidebar-group-options">
              {(group.options || []).map((opt) => {
                const key = group.name + ":" + opt;
                return (
                  <label className="filters-sidebar-option" key={key}>
                    <input
                      className="filters-sidebar-checkbox"
                      type="checkbox"
                      checked={!!checked[key]}
                      onChange={() => toggleCheck(key)}
                    />
                    <span className="filters-sidebar-option-label">{opt}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </aside>
  );
}
