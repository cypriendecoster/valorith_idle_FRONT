import { useState } from 'react';

export default function useBalanceEdits() {
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState({});

  const updateField = (type, id, field, value) => {
    const key = `${type}:${id}`;
    setEdits((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value,
      },
    }));
  };

  const isRowSaving = (type, id) => !!saving[`${type}:${id}`];

  const setRowSaving = (type, id, value) => {
    const key = `${type}:${id}`;
    setSaving((prev) => ({ ...prev, [key]: value }));
  };

  const clearRowEdits = (type, id) => {
    const key = `${type}:${id}`;
    setEdits((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return {
    edits,
    saving,
    updateField,
    isRowSaving,
    setRowSaving,
    clearRowEdits,
  };
}
