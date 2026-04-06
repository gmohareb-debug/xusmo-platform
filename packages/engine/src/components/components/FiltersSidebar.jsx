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
    <aside className="w-full max-w-xs">
      {title && (
        <h3
          className="text-lg font-bold mb-4"
          style={{ color: 'var(--text, #1c1c1c)', fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h3>
      )}
      <div className="flex flex-col gap-2">
        {groups.map((group) => (
          <div
            key={group.name}
            className="rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--border, #e5e7eb)' }}
          >
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors duration-150 hover:brightness-95"
              style={{
                backgroundColor: 'var(--surface, #fff)',
                color: 'var(--text, #1c1c1c)',
              }}
              type="button"
              onClick={() => toggleCollapse(group.name)}
            >
              <span>{group.name}</span>
              <span className="text-base" style={{ color: 'var(--muted, #6b7280)' }}>
                {collapsed[group.name] ? "+" : "\u2212"}
              </span>
            </button>
            {!collapsed[group.name] && (
              <div
                className="flex flex-col gap-2 px-4 py-3"
                style={{ borderTop: '1px solid var(--border, #e5e7eb)' }}
              >
                {(group.options || []).map((opt) => {
                  const key = group.name + ":" + opt;
                  return (
                    <label
                      className="flex items-center gap-2.5 cursor-pointer text-sm"
                      style={{ color: 'var(--text, #1c1c1c)' }}
                      key={key}
                    >
                      <input
                        className="w-4 h-4 rounded accent-[var(--accent,#3b82f6)]"
                        type="checkbox"
                        checked={!!checked[key]}
                        onChange={() => toggleCheck(key)}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
