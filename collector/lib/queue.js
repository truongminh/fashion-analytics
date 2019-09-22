
// const running = [];
// const parallel = 1;
// for (let job of jobs) {
//     let p = job();
//     running.push(p);
//     p.catch(e => console.error(e.stack || e))
//         .then(() => running.splice(running.indexOf(p), 1));
//     if (running.length >= parallel) {
//         await Promise.race(running);
//     }
// }
// await Promise.all(running);
