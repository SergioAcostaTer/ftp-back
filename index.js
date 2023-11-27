const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const sendEmail = require("./services/mail");
const setUpCron = require("./services/cron");
const checkPasswordMiddleware = require("./middleware/checkPasswordMiddleware");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const MAX_ATTEMPTS = 10;
const users = {};
let totalAttempts = 0;

setUpCron(() => {
  totalAttempts = 0;
  return totalAttempts;
});

app.post("/login", async (req, res) => {
  const providedPassword = req.headers.authorization;
  const ipList = (
    req.headers["x-forwarded-for"] || req.connection.remoteAddress
  ).split(",");
  const ip = ipList[0].trim();

  console.log("IP:", ip, users[ip]);

  totalAttempts++;

  if (totalAttempts >= 100) {
    await sendEmail(
      "sergio.acosta101@alu.ulpgc.es",
      "MASSIVE ATTACK",
      `Max attempts reached from IP: ${ip}`
    );
  }

  if (
    users[ip] &&
    users[ip].attempts >= MAX_ATTEMPTS &&
    !users[ip].sendedEmail
  ) {
    await sendEmail(
      "sergio.acosta101@alu.ulpgc.es",
      "FTP API - Max attempts reached",
      `Max attempts reached from IP: ${ip}`
    );

    users[ip].sendedEmail = true;
  }

  if (!users[ip]) {
    users[ip] = {
      attempts: 0,
      sendedEmail: false,
    };
  }

  if (
    !providedPassword ||
    providedPassword !== process.env.FTP_PASSWORD ||
    users[ip].attempts >= MAX_ATTEMPTS
  ) {
    users[ip].attempts++;
    return res.json({ success: false });
  }

  res.json({ success: true });
});

app.use((req, res, next) => {
  if (req.path !== "/login") {
    checkPasswordMiddleware(req, res, next);
  } else {
    next();
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to the Ftp API");
});

app.use("/", require("./routes/crud"));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
