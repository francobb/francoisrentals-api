export function getTransactionsPerHouse(info, location) {
  let item = '';
  const [first_line, last_line] = ['Beginning Cash Balance as of', 'Ending Cash Balance'];
  const first_column = 'Date';
  const regex = /(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{4})/gi;
  const cleanedUp = info
    .replaceAll('\n', ' ')
    .split('\n')
    .filter(w => w)
    .toString();

  if (location) {
    item = cleanedUp.substring(cleanedUp.search(location)).split(last_line)[0]; //cleanup "\n"
    if (item.startsWith(location))
      return item
        .slice(item.search(first_column))
        .split(first_line)[1]
        .trim()
        .split(regex)
        .filter(w => w)
        .filter(w => w !== '/')
        .slice(2); // Start at Columns (DATE)
  }

  item = cleanedUp.substring(cleanedUp.search(first_line)).split(last_line)[0];

  return item
    .slice(0)
    .split(first_line)[1]
    .trim()
    .split(regex)
    .filter(w => w)
    .filter(w => w !== '/')
    .slice(2);
}
