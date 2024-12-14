export default function formatDate(dbDate) {
  const dateObj = new Date(dbDate);

  // Check if string can be converted to date
  if (!isNaN(dateObj.getMonth())) {
    return `${dateObj.getDate()}/${
      dateObj.getMonth() + 1
    }/${dateObj.getFullYear()}`;
  } else return dbDate;
}
