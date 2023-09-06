const { getAll } = require('../src/openorchid-webapps');
const { performTest, states } = require('./test');

performTest(async () => {
  await getAll();
}).then((code) => {
  switch (code) {
    case states.PASS:
      console.log('Webapps passed testing!');
      break;

    case states.FAILED:
      console.log('Webapps failed testing...');
      break;

    case states.UNKNOWN:
      console.log("Webapps testing isn't working as expected");
      break;

    default:
      break;
  }
});
