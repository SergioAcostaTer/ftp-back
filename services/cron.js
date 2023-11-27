const cron = require("node-cron");
const axios = require("axios");

const setUpCron = (resetCallback) => {
  cron.schedule("*/10 * * * *", async () => {
    const response = await axios.get("https://ftp-back.onrender.com");
    console.log(response.data);
    resetCallback();
  });
};

module.exports = setUpCron;
