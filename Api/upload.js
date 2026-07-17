import { put } from '@vercel/blob';
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(500).json({ error: 'Upload failed' });
      }
      const file = files.file[0];
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }
      const fileBuffer = fs.readFileSync(file.filepath);
      const filename = `portfolio-${Date.now()}.pdf`;
      const blob = await put(filename, fileBuffer, {
        access: 'public',
      });
      return res.status(200).json({ url: blob.url });
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}