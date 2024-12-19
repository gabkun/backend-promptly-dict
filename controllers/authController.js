import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';
import Memo from '../models/Memo.js';

//register function
const register = async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
  
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }
  
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const newUser = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'user', 
      });
  
      await newUser.save();
  
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
  
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
  
      res.status(201).json({
        message: 'User registered successfully',
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
        token,
      });
    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  };
  
  // Login function
  const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
  
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(404).json({ error: 'User not found' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
  
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
  
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  };
  const getUsers = async (req, res) => {
    try {
      const role = req.query.role || 'user'; 
      const users = await User.find({ role });
  
      res.status(200).json({
        message: 'Users retrieved successfully!',
        users,
      });
    } catch (error) {
      console.error('Error fetching Users:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  };

  const fetchUserById = async (req, res) => {
    try {
      const { userId } = req.params; 
  
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
  
      const user = await User.findById(userId); 
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({
        message: 'User retrieved successfully!',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  };
  

  const getLoggedInUserId = async (req, res) => {
    try {
      const userId = req.user._id; 
      res.status(200).json({ userId });
    } catch (error) {
      console.error('Error fetching logged-in user ID:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  };
  const countTotalUsers = async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      res.status(200).json({
        message: 'Total users counted successfully.',
        totalUsers,
      });
    } catch (error) {
      console.error('Error counting total users:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };

  const deleteUserAndMemos = async (req, res) => {
    try {
      const { userId } = req.params;  
  
      const deletedMemos = await Memo.deleteMany({ userId }); 
      
      // Now, delete the user
      const deletedUser = await User.findByIdAndDelete(userId);
      
      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Respond with success message
      res.status(200).json({
        message: 'User and associated memos deleted successfully',
        deletedUser,
        deletedMemos,
      });
    } catch (error) {
      console.error('Error deleting user and memos:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  };
export { register, login, getUsers, fetchUserById, getLoggedInUserId, countTotalUsers, deleteUserAndMemos };  