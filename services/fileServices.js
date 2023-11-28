const ftp = require("basic-ftp");
require("dotenv").config();

async function connectAndExecute(callback) {
  const ftpClient = new ftp.Client();
  try {
    await ftpClient.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE === "true",
    });

    const result = await callback(ftpClient);
    return result;
  } catch (err) {
    console.error("Error:", err.message);
    throw err;
  } finally {
    ftpClient.close();
  }
}

async function listFiles(path) {
  return connectAndExecute(async (client) => {
    try {
      console.log(`Listing files on path: ${path}`);
      const files = await client.list(path);

      console.log(files);

      const data = {
        dir: [],
        files: [],
      };

      files.forEach((file) => {
        if (file.isDirectory) {
          data.dir.push({
            name: file.name,
            date: file.modifiedAt,
          });
        } else {
          data.files.push({
            name: file.name,
            size: file.size,
            date: file.modifiedAt,
          });
        }
      });

      return {
        status: 200,
        data,
      };
    } catch (err) {
      return {
        status: 500,
        data: err,
      };
    }
  });
}

async function createFolder(path) {
  return connectAndExecute(async (client) => {
    try {
      console.log(`Creating folder on path: ${path}`);
      const folder = await client.ensureDir(path);

      console.log(`Folder created: ${path}`);
      return folder;
    } catch (err) {
      console.error(`Error creating folder on path ${path}:`, err);
      throw err;
    }
  });
}

async function download(destination, remotePath, startAt = 0) {
  return connectAndExecute(async (client) => {
    try {
      const size = await client.size(remotePath);

      if (startAt >= size) {
        throw new Error("Invalid startAt position");
      }

      const readableStream = await client.downloadTo(
        destination,
        remotePath,
        startAt
      );

      return readableStream;
    } catch (err) {
      throw err;
    }
  });
}

async function upload(path, name) {
  return connectAndExecute(async (client) => {
    try {
      const result = await client.uploadFrom(path, name);
      return result;
    } catch (err) {
      console.error(`Error uploading file to path -> ${name}:`, err);
      throw err;
    }
  });
}

async function deleteFile(path) {
  return connectAndExecute(async (client) => {
    try {
      const result = await client.remove(path);
      return result;
    } catch (err) {
      console.error(`Error deleting file on path -> ${path}:`, err);
      throw err;
    }
  });
}

module.exports = {
  listFiles,
  createFolder,
  download,
  connectAndExecute,
  upload,
  deleteFile,
};
