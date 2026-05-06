import { separateArray } from './separate-array.utils';

const DEFAULT_BATCH_PROMISES_LIMIT = 10;

export const runBatchPromises = async (
  functions: any[],
  limit: number = DEFAULT_BATCH_PROMISES_LIMIT,
): Promise<any> => {
  const batchCount = Math.ceil(functions.length / limit);

  const functions_separated = separateArray(functions, batchCount);

  const functions_separated_exec = functions_separated.map((el) => {
    return async () => {
      let responses = [];
      for (let index = 0; index < el.length; index++) {
        const func = el[index];
        responses.push(await func());
      }
      return responses;
    };
  });

  const res = await Promise.all(functions_separated_exec.map((func) => func()));

  return res.reduce((pv, cv) => {
    return [...pv, ...cv];
  }, []);
};
