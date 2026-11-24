import Subscriber from '../models/Subscriber.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeNewsletter(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'active';
        await existing.save();
        return res.json({ message: 'Welcome back — your Threat Brief subscription is active.' });
      }
      return res.json({ message: 'You are already subscribed to the Cyber India News Threat Brief.' });
    }

    await Subscriber.create({ email });
    res.status(201).json({
      message: 'Subscribed! You will receive our daily cybersecurity & technology intelligence brief.',
    });
  } catch (err) {
    next(err);
  }
}
