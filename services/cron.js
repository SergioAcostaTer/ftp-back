const cron = require("node-cron");
const fetch = require("node-fetch");

const setUpCron = (resetCallback) => {
  cron.schedule("*/10 * * * *", async () => {
    try {
      await fetch("https://ftp-back.onrender.com");
      console.log("API ping successful");
    } catch (error) {
      console.error("Error while pinging API:", error);
    } finally {
      const now = resetCallback();
      console.log(`Total attempts: ${now}`);
    }
  });
};

module.exports = setUpCron;
