export function notFound(_req, res) {
  res.status(404).json({ error: 'API endpoint not found' });
}

export function errorHandler(err, _req, res, _next) {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Uploaded file exceeds the 8MB size limit.' });
  }

  if (err?.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join('. ') });
  }

  if (err?.code === 11000) {
    return res.status(409).json({ error: 'A record with that unique value already exists.' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
}
