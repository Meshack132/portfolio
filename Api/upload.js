import { put } from '@vercel/blob';
import Busboy from 'busboy';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const busboy = Busboy({ headers: req.headers });
  const chunks = [];
  let filename = '';

  busboy.on('file', (fieldname, file, info) => {
    filename = info.filename;
    file.on('data', (chunk) => {
      chunks.push(chunk);
    });
  });

  busboy.on('finish', async () => {
    const buffer = Buffer.concat(chunks);
    try {
      const blob = await put(`portfolio-${Date.now()}.pdf`, buffer, {
        access: 'public',
      });
      res.status(200).json({ url: blob.url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  req.pipe(busboy);
}