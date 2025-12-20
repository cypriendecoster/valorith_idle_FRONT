import { useEffect, useState } from 'react';

export default function useConfirmModal({ normalizeText }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmDanger, setConfirmDanger] = useState(true);
  const [confirmLabel, setConfirmLabel] = useState('Confirmer');
  const [confirmExpectedText, setConfirmExpectedText] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmDetails, setConfirmDetails] = useState(null);

  useEffect(() => {
    if (!confirmOpen) return;
    setConfirmInput('');
    setConfirmError('');
    setConfirmLoading(false);
  }, [confirmOpen]);

  function openConfirm({
    title,
    message,
    confirmLabel: nextConfirmLabel = 'Confirmer',
    danger = true,
    expectedText = '',
    details = null,
    action,
  }) {
    setConfirmTitle(title || 'Confirmation');
    setConfirmMessage(message || '');
    setConfirmLabel(nextConfirmLabel);
    setConfirmDanger(danger);
    setConfirmExpectedText(expectedText);
    setConfirmDetails(details);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  }

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setConfirmAction(null);
    setConfirmDetails(null);
  };

  const submitConfirm = async () => {
    if (confirmLoading) return;

    if (confirmExpectedText) {
      const expected = normalizeText
        ? normalizeText(confirmExpectedText)
        : String(confirmExpectedText || '').trim();
      const actual = normalizeText
        ? normalizeText(confirmInput)
        : String(confirmInput || '').trim();
      if (expected !== actual) {
        setConfirmError(`Tape \"${expected}\" pour confirmer.`);
        return;
      }
    }

    if (!confirmAction) {
      closeConfirm();
      return;
    }

    try {
      setConfirmLoading(true);
      setConfirmError('');
      const result = await confirmAction();
      if (result === false) return;
      closeConfirm();
    } catch (err) {
      console.error(err);
      setConfirmError(
        err?.response?.data?.message || 'Action impossible. Ressaye.'
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const confirmProps = {
    open: confirmOpen,
    title: confirmTitle,
    message: confirmMessage,
    danger: confirmDanger,
    confirmLabel,
    expectedText: confirmExpectedText,
    inputValue: confirmInput,
    onInputChange: setConfirmInput,
    details: confirmDetails,
    loading: confirmLoading,
    error: confirmError,
    onCancel: closeConfirm,
    onConfirm: submitConfirm,
  };

  return {
    confirmProps,
    openConfirm,
  };
}
