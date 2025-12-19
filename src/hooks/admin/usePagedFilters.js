export default function usePagedFilters({ setPage }) {
  const withPageReset = (setter, { after } = {}) => (value) => {
    setter(value);
    setPage(0);
    if (after) after(value);
  };

  const resetPage = () => setPage(0);

  return { withPageReset, resetPage };
}
