/**
 * Execute each tests and returns results.
 *
 * @param {Test[]} tests array of Test. Test.input: () => code to test. Test.expected: expected result of input().
 * @returns string of test results.
 */
function test(tests) {
  return tests.map(t => {
    const label = t.input.toString().replace('() => ', '');
    return t.input() == t.expected
      ? `success: ${label} => ${t.expected}`
      : `fail: ${label} => ${t.expected}: get:${t.input()} expected:${t.expected}`
  }).join('\n') + '\n';
}

export { test };
