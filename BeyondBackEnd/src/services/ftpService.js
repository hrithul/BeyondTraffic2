require('dotenv').config();
const ftp = require('ftp');
const saveToMongo = require('../utils/saveToMongo');
const { getDeviceByDevSiteId } = require('../controllers/deviceController');

const fetchJsonFromFTP = () => {
  return new Promise((resolve, reject) => {
    const client = new ftp();
    const noopInterval = 10000; // NOOP interval in ms
    let noopTimer;

    const clearNoopTimer = () => {
      if (noopTimer) clearInterval(noopTimer);
    };

    const retryWithDelay = (fn, retries = 3, delay = 2000) => {
      return fn().catch((err) => {
        if (retries > 0) {
          console.log(`Retrying... Attempts left: ${retries}`);
          return new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
            retryWithDelay(fn, retries - 1, delay)
          );
        } else {
          throw err;
        }
      });
    };

    client.on('ready', () => {
      console.log('FTP connection ready...');
      client.list(process.env.FTP_PATH, (err, list) => {
        if (err) {
          console.error('Error listing FTP files:', err);
          clearNoopTimer();
          client.end();
          return reject(err);
        }

        

        const handleFileTransfer = (file) => {
          return new Promise((resolve, reject) => {
            const sourcePath = `${process.env.FTP_PATH}/${file.name}`;
            const destinationPath = `${process.env.FTP_PATH}/Processed/${file.name}`;
            const errorDestinationPath = `${process.env.FTP_PATH}/Error/${file.name}`;
            console.log(sourcePath, destinationPath, errorDestinationPath)

            client.get(sourcePath, (err, stream) => {
              if (err) {
                console.error(`Error fetching file ${file.name}: ${err}`);
                return reject(err);
              }

              let data = '';
              stream.setEncoding('utf8');
              stream.on('data', (chunk) => (data += chunk));
              stream.on('end', async () => {
                console.log(`File fetched: ${file.name}`);
                try {
                  const jsonData = JSON.parse(data);
                  const store_code = jsonData.Metrics['@SiteId'];
                  const device_id = jsonData.Metrics['@DeviceId'];

                  const exists = await getDeviceByDevSiteId(store_code, device_id);

                  if (exists) {
                    await saveToMongo(jsonData);
                    client.rename(sourcePath, destinationPath, (renameErr) => {
                      if (renameErr) {
                        console.error(`Error moving file ${file.name}:, renameErr`);
                        return reject(renameErr);
                      } else {
                        console.log(`File moved to Completed folder: ${file.name}`);
                        resolve();
                      }
                    });
                  } else {
                    client.rename(sourcePath, errorDestinationPath, (renameErr) => {
                      if (renameErr) {
                        console.error('Error moving file ${file.name}:', renameErr);
                        return reject(renameErr);
                      } else {
                        console.log(`File moved to Error folder: ${file.name}`);
                        resolve();
                      }
                    });
                  }
                } catch (parseErr) {
                  console.error('Error processing file ${file.name}:', parseErr);
                  reject(parseErr);
                }
              });
            });
          });
        };

        const jsonFiles = list.filter((file) => file.name.endsWith(".json"));
        if (!jsonFiles.length) {
          console.log("No JSON files found.");
          clearNoopTimer();
          client.end();
          return resolve("No files to process.");
        }

        jsonFiles
          .reduce((promise, file) => {
            return promise.then(() => retryWithDelay(() => handleFileTransfer(file)));
          }, Promise.resolve())
          .then(() => {
            console.log('All files processed.');
            clearNoopTimer();
            client.end();
            resolve('All files processed successfully.');
          })
          .catch((err) => {
            console.error('Error during file processing:', err);
            clearNoopTimer();
            client.end();
            reject(err);
          });
      });
    });

    client.on('error', (err) => {
      console.error('FTP client error:', err);
      reject(err);
    });

    client.on('close', () => {
      console.log('FTP connection closed.');
    });

    client.connect({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      connTimeout: 30000,
      pasvTimeout: 30000,
      keepalive: 30000,
      pasv: true,
    });
  });
};

module.exports = fetchJsonFromFTP;