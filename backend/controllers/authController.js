const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");


// Register User
const registerUser = async (req, res) => {
  try {

    const { name, username, email, password } = req.body;


    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }


    const existingUser = await User.findOne({
      $or: [{ email }, { username: username.toLowerCase() }],
    });


    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email,
      password: hashedPassword,
    });


    res.status(201).json({
      message: "User Registered Successfully",
      user,
    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



// Login User (accepts username OR email)
const loginUser = async (req, res) => {

  try {

    const { identifier, password } = req.body;


    if (!identifier || !password) {
      return res.status(400).json({
        message: "Please enter username/email and password",
      });
    }


    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
      ],
    });


    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );


    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }


    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );


    res.status(200).json({

      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },

    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};


// Forgot Password - Send OTP to email
const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Please provide your email",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(
      user.email,
      "Your Password Reset OTP",
      `<h2>Password Reset</h2>
       <p>Your OTP is: <b style="font-size:20px;">${otp}</b></p>
       <p>This code expires in 10 minutes. If you didn't request this, ignore this email.</p>`
    );

    res.status(200).json({
      message: "OTP sent to your email",
    });

  } catch (error) {

    console.error("forgotPassword error:", error);

    res.status(500).json({
      message: error.message,
    });

  }
};


// Verify OTP
const verifyOTP = async (req, res) => {
  try {

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Please provide email and OTP",
      });
    }

    const user = await User.findOne({ email });

    if (!user || user.resetOTP !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (!user.resetOTPExpiry || user.resetOTPExpiry < Date.now()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    res.status(200).json({
      message: "OTP verified",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// Reset Password after OTP verification
const resetPassword = async (req, res) => {
  try {

    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const user = await User.findOne({ email });

    if (!user || user.resetOTP !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (!user.resetOTPExpiry || user.resetOTPExpiry < Date.now()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
};