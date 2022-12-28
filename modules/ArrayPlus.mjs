/**
 * Returns the first element in the provided array that satisfies the provided testing function.
 * If no values satisfy the testing function, undefined is returned.
 * [javascript - Using an async function in Array.find() - Stack Overflow](https://stackoverflow.com/a/55601090)
 * @param {[]} array
 * @param {async (*, number, []) => boolean} asyncPredicate
 * @return {*|undefined} 
 */
async function findAsyncParallel(array, asyncPredicate) {
  if (asyncPredicate.constructor.name != 'AsyncFunction') {
    throw `asyncPredicate is not async function: ${asyncPredicate.constructor.name}`;
  }
  const results = await Promise.all(array.map(asyncPredicate));
  const index = results.findIndex(result => result);
  return array[index];
}

/**
 * Returns the first element in the provided array that satisfies the provided testing function.
 * If no values satisfy the testing function, undefined is returned.
 * [javascript - Using an async function in Array.find() - Stack Overflow](https://stackoverflow.com/a/63795192)
 * @param {[]} array
 * @param {async (*, number, []) => boolean} asyncPredicate
 * @return {*|undefined} 
 */
async function findAsyncSequential(array, asyncPredicate) {
  if (asyncPredicate.constructor.name != 'AsyncFunction') {
    throw `asyncPredicate is not async function: ${asyncPredicate.constructor.name}`;
  }
  let index = 0;
  for (const element of array) {
    if (await asyncPredicate(element, index++, array)) { return element; }
  }
  return undefined;
}

export { findAsyncParallel, findAsyncSequential };