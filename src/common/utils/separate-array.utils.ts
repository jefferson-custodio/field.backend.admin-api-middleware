export const separateArray = (base, maximum) => {
  const result = [];
  let group = [];

  for (let index = 0; index < base.length; index++) {
    group.push(base[index]);

    if (group.length === maximum || index === base.length - 1) {
      result.push(group);
      group = [];
    }
  }

  return result;
};
