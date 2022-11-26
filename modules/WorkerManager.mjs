/**
 * Helper class for Web Worker.
 * @export
 * @class WorkerManager
 */
export default class WorkerManager {
  #url = null;
  #reportProgress = (progress) => { };
  #workers = [];
  #range = (max) => Array.from({ length: max }, (_, i) => (i));
  /**
   * Function as worker source
   * @param {() => void} fnc
   * @memberof WorkerManager
   */
  set source(fnc) {
    if (typeof fnc != 'function') { return; }
    this.#url = URL.createObjectURL(
      new Blob([`(${fnc})();`], { type: 'application/javascript' }));
  }
  /**
   * Function called by the worker while running.
   * @memberof WorkerManager
   */
  get reportProgress() {
    return this.#reportProgress;
  }
  set reportProgress(fnc) {
    if (typeof fnc != 'function') { return; }
    this.#reportProgress = fnc;
  }
  /**
   * Release resources
   * @memberof WorkerManager
   */
  dispose() {
    URL.revokeObjectURL(this.#url);
    this.#url = null;
    this.#reportProgress = null;
    this.#workers = null;
  }
  /**
   * Create a Promise including Worker and start it
   * @param {*} id Worker id
   * @param {*} initialData Part of initial data for worker
   * @param {*} option Passed to each workers as unchanged.
   * @return {Promise} Promise including Worker
   * @memberof WorkerManager
   */
  create(id, initialData, option) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(this.#url);
      worker.reportProgress = this.#reportProgress;
      worker.addEventListener(
        'message',
        (event) => {
          const data = event.data;
          switch (data.type) {
            case 'Progress':
              event.target.reportProgress(data.progress);
              break;
            case 'Completed':
              console.log(data.message);
              resolve(data.result);
              break;
            case 'Error':
              console.log(data.message);
              reject(data.message);
              break;
          }
        }
      );
      worker.addEventListener('error', reject);
      worker.postMessage({ id: id, data: initialData, option: option, });
      this.#workers.push(worker);
    });
  }
  /**
   * Create workers from data and run them
   * @param {Array} data Array of initial data. divided and each parts are passed to workers.
   * @param {number} threads Number of threads
   * @param {*} option Passed to each workers as unchanged.
   * @return {Promise} Worker results
   * @memberof WorkerManager
   */
  async run(data, threads, option) {
    const from = (i) => Math.ceil(data.length * i / threads);
    const divided = this.#range(threads).map((i) => data.slice(from(i), from(i + 1)));
    console.log(divided);
    return await Promise.all(divided.map((part, i) => this.create(i, part, option)));
  }
  /**
   * Notify all workers that they should be cancelled
   * @memberof WorkerManager
   */
  cancelAll() {
    this.#workers.forEach((worker) => { worker.postMessage('cancel'); })
  }
}
