import fs from 'fs';
async function upload() {
  const fileContent = fs.readFileSync('functions/test_gemini.js');
  const response = await fetch('https://publisher.walrus-testnet.walrus.space/v1/blobs?epochs=1', {
    method: 'PUT',
    body: fileContent,
  });
  const data = await response.json();
  let blobId = data.newlyCreated?.blobObject?.blobId || data.alreadyCertified?.blobId;
  console.log('Blob ID:', blobId);
}
upload();
