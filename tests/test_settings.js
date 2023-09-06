const { getValue, setValue } = require('../src/openorchid-settings');
const { performTest, states } = require('./test');

performTest(async () => {
  await getValue('date.timezone');
  setValue('date.timezone', 'America/New_York');
}).then((code) => {
  switch (code) {
    case states.PASS:
      console.log('Settings passed testing!');
      break;

    case states.FAILED:
      console.log('Settings failed testing...');
      break;

    case states.UNKNOWN:
      console.log("Settings testing isn't working as expected");
      break;

    default:
      break;
  }
});
