export function handleImageUpload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Please select an image file to upload.' });
  }

  const relativeUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({
    url: relativeUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
}
