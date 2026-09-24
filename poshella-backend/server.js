require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Temporary memory store for active OTPs
const otpStore = {};

// 1. ROUTE TO SEND OTP
app.post('/api/send-otp', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Format phone number to international standard (e.g., 09020211981 -> 2349020211981)
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '234' + formattedPhone.substring(1);
    }

    // Generate random 6-digit code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP with 5-minute expiration
    otpStore[formattedPhone] = {
        code: generatedOtp,
        expiresAt: Date.now() + 5 * 60 * 1000
    };

    try {
        // Send SMS via Termii API
        await axios.post('https://api.ng.termii.com/api/sms/send', {
            to: formattedPhone,
            from: "N-ALERT",
            sms: `Your Poshella Cosmetics verification code is: ${generatedOtp}. Valid for 5 minutes.`,
            type: "plain",
            channel: "generic",
            api_key: process.env.TERMII_API_KEY
        });

        res.json({ success: true, message: 'OTP sent successfully to your phone!' });
    } catch (error) {
        console.error('Termii API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'Failed to send OTP SMS. Try again.' });
    }
});

// 2. ROUTE TO VERIFY OTP
app.post('/api/verify-otp', (req, res) => {
    const { phone, code } = req.body;

    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '234' + formattedPhone.substring(1);
    }

    const record = otpStore[formattedPhone];

    if (!record) {
        return res.status(400).json({ success: false, message: 'No OTP request found for this number.' });
    }

    if (Date.now() > record.expiresAt) {
        delete otpStore[formattedPhone];
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (record.code !== code.trim()) {
        return res.status(400).json({ success: false, message: 'Invalid OTP code. Check and try again.' });
    }

    // Success: Delete OTP so it cannot be reused
    delete otpStore[formattedPhone];
    res.json({ success: true, message: 'Phone number verified successfully!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
