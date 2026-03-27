const express = require("express");
const {
  submitContact,
  getContacts,
  markAsRead,
} = require("../controllers/contactController");
const { protect, authorizeAdmin } = require("../middlewares/auth");

const router = express.Router();

router.post("/", submitContact);
router.get("/", protect, authorizeAdmin, getContacts);
router.patch("/:id/read", protect, authorizeAdmin, markAsRead);

module.exports = router;
