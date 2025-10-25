export const postPopulate = [
  { path: 'creator', populate: 'avatar' },
  { path: 'category' },
  { path: 'game' },
  { path: 'tags' },
  { path: 'coverImage' },
];
