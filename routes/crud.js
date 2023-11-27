const express = require("express");
const multiparty = require("multiparty");
const {
  listFiles,
  createFolder,
  download,
  upload,
  deleteFile,
} = require("../services/fileServices");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to the Ftp API");
});

router.get("/to", async (req, res) => {
  const files = await listFiles("/drive");
  return res.json(files);
});

router.get("/to/:path", async (req, res) => {
  let { path } = req.params;
  const finalPath = path.split("-").join("/");

  const files = await listFiles(`/drive/${finalPath}`);
  return res.json(files);
});

router.post("/mkdir/:path", async (req, res) => {
  let { path } = req.params;
  const finalPath = path.split("-").join("/");

  await createFolder(`/drive/${finalPath}`);

  return res.json({ message: "Folder created successfully.", path: finalPath });
});

router.get("/download/:path", async (req, res) => {
  const { path } = req.params;
  const finalPath = path.split("-").join("/");

  const writableStream = res;

  try {
    await download(writableStream, `/drive/${finalPath}`);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/upload", (req, res) => {
  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ error: "Error parsing form data." });
    }

    const { remotePath, fileName } = fields;
    const { file } = files;
    const finalPath = `drive/${remotePath}`.split("-").join("/");

    const uploadPromises = file.map(async (fileInfo) => {
      const filePath = fileInfo.path;
      const destinationPath = finalPath + "/" + fileName;

      await upload(filePath, destinationPath);
    });

    await Promise.all(uploadPromises);

    res.status(200).json({ message: "Upload successful", result: "success" });
  });
});

router.delete("/deleteFile/:path", async (req, res) => {
  const { path } = req.params;
  console.log("path", path);

  const finalPath = `drive/${path.split("-").join("/")}`;

  try {
    await deleteFile(finalPath);
    res.status(200).json({ message: "File deleted successfully." });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
