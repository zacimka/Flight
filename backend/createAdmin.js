require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = process.argv[2] || process.env.EMAIL_USER;
    const password = process.argv[3] || process.env.EMAIL_PASS;

    if (!email || !password) {
      console.log('Error: EMAIL_USER or EMAIL_PASS not found in .env');
      process.exit(1);
    }

    let user = await User.findOne({ email });

    if (user) {
      user.role = 'admin';
      user.password = password; // this will trigger the pre-save hook to hash the new password
      await user.save();
      console.log('Admin user updated successfully with .env credentials.');
    } else {
      user = new User({
        name: 'Admin',
        email: email,
        password: password,
        role: 'admin'
      });
      await user.save();
      console.log('Admin user created successfully with .env credentials.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();
