export const getYearFromFilename = (filename: string) => {
  const match = filename.match(/(?:^|[^0-9])((19|20)\d{2})(?!\d)/);
  return match?.[1] ?? "";
};