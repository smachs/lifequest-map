export const formatList = (list: string[]) => {
  const lf = new Intl.ListFormat('en');
  return lf.format(list);
};
