export function filterObjectArray(array, filterKey, filterTerm) {
  const lowerCaseFilterTerm = filterTerm.toLowerCase();
  return array.filter((rowData) =>
                        rowData[filterKey] &&
                        rowData[filterKey].toLowerCase().startsWith(lowerCaseFilterTerm));
}

export function sortObjectArray(array, sortKey, isAscending) {
  const results = array.sort((rowDataA, rowDataB) => {
    if (rowDataA[sortKey] < rowDataB[sortKey]) return -1;
    if (rowDataA[sortKey] > rowDataB[sortKey]) return 1;
    return 0;
  });
  if (!isAscending) return results.reverse();
  return results;
}
