const db = require('../services/db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const myEmail = process.env.MY_EMAIL;
const myPassword = process.env.MY_PASSWORD;
//send otp via mail
exports.forgotPassword = (req, res, next) => {
    try {
        const { username, email } = req.body;

        const query = 'SELECT * FROM users WHERE email = ?';

        db.query(query, [email], (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            if (results.length === 0) {
                return res.status(401).json({ error: 'Invalid Email!' });
            }

            const user = results[0];
            const otp = Math.floor(1000 + Math.random() * 9000);
            const otpExpires = new Date();
            otpExpires.setMinutes(otpExpires.getMinutes() + 5);

            //If the user is found in the database go ahead and send otp to the user

            const updateQuery = 'UPDATE users SET otp = ?, otp_expire_time = ? WHERE email = ?';
            const values = [otp, otpExpires, email];

            db.query(updateQuery, values, (error, results) => {
                if (error) {
                    return res.status(500).json({ error: error.message });
                }

                const transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: myEmail,
                        pass: myPassword
                    },
                });

                const mailOptions = {
                    from: myEmail,
                    to: email,
                    subject: "One Time Password (OTP) for Forgot Password recovery on Auction Platform",
                    text: `Your One Time Password (OTP) for Forgot Password recovery on Auction Platform is ${otp}.`
                };

                transporter.sendMail(mailOptions, (error, results) => {
                    if (error) {
                        return res.status(500).json({ error: error.message });
                    }
                    res.status(200).json({ message: 'Successfully sent OTP to the registered email id' });
                });
            });

        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

//check for OTP and reset password
exports.resetPassword = async (req, res) => {
    try {
        const { newPassword, otp } = req.body;

        //hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const query = 'SELECT * FROM users WHERE otp = ? AND otp_expire_time > NOW()';

        db.query(query, [otp], (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            if (results.length === 0) {
                return res.status(401).json({ error: 'Incorrect OTP!' });
            }

            const email = results[0].email;

            const updateQuery = 'UPDATE users SET _password = ?, otp = null, otp_expire_time=null WHERE otp = ?';
            const values = [hashedPassword, otp];

            db.query(updateQuery, values, (error, results) => {
                if (error) {
                    return res.status(500).json({ error: error.message });
                }
                if (results.length === 0) {
                    return res.status(401).json({ error: 'Incorrect OTP!' });
                }

                const transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: myEmail,
                        pass: myPassword
                    },
                });

                const mailOptions = {
                    from: myEmail,
                    to: email,
                    subject: "Password Reset Successful",
                    text: `You have successfully reset your password.`
                };

                transporter.sendMail(mailOptions, (error, results) => {
                    if (error) {
                        return res.status(500).json({ error: error.message });
                    }
                    res.status(200).json({ message: 'Password reset successful!' });
                });
            });

        })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
// USE AXIOS library to call the api endpoints.