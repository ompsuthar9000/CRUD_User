import express from 'express';
import multer from 'multer';
import { registerUser, getAllUsers, updateUser, deleteUser } from '../controllers/userController.js';
const router = express.Router();

// Register user route - now using Busboy for file handling
router.post("/register",registerUser);

// Other routes remain the same
router.get("/users", getAllUsers);
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);

export default router;
