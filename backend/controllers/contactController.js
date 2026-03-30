const Contact = require('../models/Contact');
const { sendContactNotification } = require('../services/emailService');

const submitContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'name, email, message required' });
    }
    const contact = await Contact.create({ name, email, message });
    
    // Send notification email to admin (fire-and-forget to prevent hanging requests)
    sendContactNotification(contact)
      .catch(emailErr => console.error('Email notification failed:', emailErr.message));

    res.status(201).json({ data: contact, message: 'Thank you! We received your message.' });
  } catch (err) {
    next(err);
  }
};

const getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort('-createdAt');
    res.json({ data: contacts });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status: 'read' }, { new: true });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ data: contact });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitContact, getContacts, markAsRead };
