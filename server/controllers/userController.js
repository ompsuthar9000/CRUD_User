import path from 'path';
import fs from 'fs';
import User from '../schema/UserSchema.js';
import bcrypt from 'bcryptjs';
import { IncomingForm } from 'formidable';

// Helper to get the current directory path in ES Module
const getCurrentDir = (url) => {
  const _filename = new URL(url).pathname;
  return path.dirname(_filename);
};



export const registerUser = async (req, res) => {
  const form = new IncomingForm();

  // Get the current directory using the helper function
  const uploadDir = path.join(getCurrentDir(import.meta.url), '../uploads');
  form.uploadDir = uploadDir; // Set the upload directory

  // Ensure the upload folder exists
  fs.mkdirSync(uploadDir, { recursive: true });

  form.keepExtensions = true; // Keep the file extension
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Error in file upload: ' + err.message });
    }
    try {
      const { name, email, mobile, password } = fields;
      const file = files.profilePicture[0];
      
      // Get original extension
      const originalExt = path.extname(file.originalFilename || file.filepath);
      const newFilename = `${Date.now()}${originalExt}`; // Unique filename
      const newFilePath = path.join(uploadDir, newFilename);

      // Rename the file to include the original extension
      fs.renameSync(file.filepath, newFilePath);

      // Construct the public URL for the file
      const publicFilePath = `${process.env.SERVER_BASE_URL}/uploads/${newFilename}`;
     
      // Hash the password
      const hash = await bcrypt.hash(password[0], 10);

      const payload = {
        name: name[0],
        email: email[0],
        mobile: Number(mobile[0]),
        profilePicture: publicFilePath, // Save the public URL in the database
        password: hash,
      };

      // Create a new user with the profile picture URL
      const newUser = await User.create(payload);

      res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user data
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {mobile,email,name} = req.body; // Extract all fields from the body to be updated
    const updatedUser = await User.findByIdAndUpdate(id, {mobile,email,name}, { new: true }); // `new: true` returns the updated document

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {

  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json( error);
  }
};
