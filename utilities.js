export function filterObjectArray(array, filterKey, filterTerm) {
  const lowerCaseFilterTerm = filterTerm.toLowerCase();
  return array.filter((rowData) =>
                        rowData[filterKey] &&
                        rowData[filterKey].toLowerCase().startsWith(lowerCaseFilterTerm));
}

export function sortObjectArray(array, sortKey, isAscending) {
  const results = array.sort((rowDataA, rowDataB) => {
    const a = rowDataA[sortKey];
    const b = rowDataB[sortKey];
    if (typeof a === 'string' && typeof b === 'string') { // If strings, sort case-insensitive
      return a.toLowerCase().localeCompare(b.toLowerCase());
    }
    // If any other type of object, e.g. a number, just use the natural ordering
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });
  if (!isAscending) return results.reverse();
  return results;
}
