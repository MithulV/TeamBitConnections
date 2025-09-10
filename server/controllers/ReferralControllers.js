import db from "../src/config/db.js";
import path from "path";
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Validate environment variables
if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Missing required email environment variables');
    process.exit(1);
}

// Email transporter setup
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Email template function
const sendReferralEmail = async (inviteeEmail, referrerEmail, referralLink) => {
    const mailOptions = {
        from: `"Your App Name" <${process.env.EMAIL_USER}>`,
        to: inviteeEmail,
        subject: `${referrerEmail} invited you to join our platform`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>You're Invited!</title>
            </head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
                    <h2 style="color: #333; margin-bottom: 20px;">🎉 You've been invited!</h2>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #555;">
                        <strong>${referrerEmail}</strong> has referred you to join our platform.
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #555;">
                        Click the button below to create your account:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${referralLink}" 
                           style="background: #007bff; color: white; padding: 15px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;
                                  font-weight: bold; font-size: 16px;">
                            Accept Invitation
                        </a>
                    </div>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin-top: 20px;">
                        <p style="margin: 0; font-size: 14px; color: #856404;">
                            ⚠️ <strong>Important:</strong> This link expires in 24 hours and can only be used once.
                        </p>
                    </div>
                    
                    <p style="font-size: 12px; color: #888; margin-top: 30px; text-align: center;">
                        If you didn't expect this invitation, you can safely ignore this email.
                    </p>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export const sendReferralInvitation = async (req, res) => {
    try {
        console.log('🔍 Backend: FRONTEND_URL loaded:', process.env.FRONTEND_URL);
        
        const { referrerEmail, inviteeEmail } = req.body;

        // Validation
        if (!referrerEmail || !inviteeEmail) {
            return res.status(400).json({
                success: false,
                message: 'Referrer email and invitee email are required'
            });
        }

        if (referrerEmail === inviteeEmail) {
            return res.status(400).json({
                success: false,
                message: 'You cannot refer yourself'
            });
        }

        // Check if referrer exists in login table
        const referrerCheck = await db`SELECT email FROM login WHERE email = ${referrerEmail}`;

        if (referrerCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Referrer not found'
            });
        }

        // Check if invitee already has an account
        const inviteeCheck = await db`SELECT email FROM login WHERE email = ${inviteeEmail}`;

        if (inviteeCheck.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already has an account'
            });
        }

        // Check for existing pending invitation
        const existingInvitation = await db`
            SELECT token FROM referral_invitations 
            WHERE invitee_email = ${inviteeEmail} 
            AND is_used = FALSE 
            AND expires_at > NOW()
        `;

        if (existingInvitation.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'An active invitation already exists for this email'
            });
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        console.log('🕐 Creating token at (UTC):', now.toISOString());
        console.log('🕐 Token expires at (UTC):', expiresAt.toISOString());

        // Insert invitation with last_activity tracking
        const result = await db`
            INSERT INTO referral_invitations 
            (referrer_email, invitee_email, token, expires_at, last_activity) 
            VALUES (${referrerEmail}, ${inviteeEmail}, ${token}, ${expiresAt}, NOW())
            RETURNING id, token, expires_at, created_at
        `;

        console.log('✅ Token created:', {
            token: token.substring(0, 20) + '...',
            created_at: result[0].created_at,
            expires_at: result[0].expires_at
        });

        // Send email
        const referralLink = `${process.env.FRONTEND_URL}/register?ref=${token}`;
        console.log('📧 Generated referral link:', referralLink);
        
        await sendReferralEmail(inviteeEmail, referrerEmail, referralLink);

        return res.status(200).json({
            success: true,
            message: 'Referral invitation sent successfully',
            invitationId: result[0].id
        });

    } catch (error) {
        console.error('❌ Error sending referral:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to send referral invitation'
        });
    }
};

export const validateReferralLink = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            console.log('❌ Backend: No token provided');
            return res.status(400).json({
                valid: false,
                message: 'Token is required'
            });
        }

        console.log('🔍 Backend: Validating token:', token.substring(0, 20) + '...');
        console.log('🕐 Backend: Server time (UTC):', new Date().toISOString());

        const result = await db`
            SELECT 
                id,
                referrer_email,
                invitee_email,
                is_used,
                expires_at,
                created_at,
                NOW() as current_db_time,
                expires_at > NOW() as is_still_valid,
                EXTRACT(EPOCH FROM (expires_at - NOW())) / 3600 as hours_remaining
            FROM referral_invitations 
            WHERE token = ${token}
        `;

        console.log('📊 Backend: Database query result:', {
            found: result.length > 0,
            result: result.length > 0 ? {
                is_used: result[0].is_used,
                expires_at: result[0].expires_at,
                current_db_time: result[0].current_db_time,
                is_still_valid: result[0].is_still_valid,
                hours_remaining: result[0].hours_remaining
            } : 'NOT FOUND'
        });

        if (result.length === 0) {
            console.log('❌ Backend: Token not found in database');
            return res.status(404).json({
                valid: false,
                message: 'Invalid referral link'
            });
        }

        const invitation = result[0];

        if (invitation.is_used === true) {
            console.log('❌ Backend: Token already used');
            return res.status(400).json({
                valid: false,
                message: 'This referral link has already been used'
            });
        }

        if (invitation.is_still_valid !== true) {
            console.log('❌ Backend: Token expired according to database');
            return res.status(400).json({
                valid: false,
                message: 'This referral link has expired'
            });
        }

        // Update last activity when validating
        await db`
            UPDATE referral_invitations 
            SET last_activity = NOW() 
            WHERE token = ${token}
        `;

        console.log('✅ Backend: Token is VALID');
        return res.status(200).json({
            valid: true,
            inviteeEmail: invitation.invitee_email,
            referrerEmail: invitation.referrer_email,
            createdAt: invitation.created_at
        });

    } catch (error) {
        console.error('❌ Backend: Error validating referral:', error);
        return res.status(500).json({
            valid: false,
            error: 'Server error during validation'
        });
    }
};

export const completeRegistration = async (req, res) => {
    try {
        const { token, email, password } = req.body;

        console.log('🚀 Backend: Starting registration for:', email);
        console.log('   Token:', token.substring(0, 20) + '...');

        // Validation
        if (!token || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Token, email, and password are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Start transaction with proper row locking
        await db.begin(async sql => {
            const checkResult = await sql`
                SELECT 
                    id,
                    referrer_email,
                    invitee_email,
                    is_used,
                    expires_at
                FROM referral_invitations 
                WHERE token = ${token}
                FOR UPDATE
            `;

            if (checkResult.length === 0) {
                throw new Error('Invalid referral token');
            }

            const invitation = checkResult[0];

            console.log('🔒 Backend: Processing token with lock:', {
                is_used: invitation.is_used,
                expires_at: invitation.expires_at,
                invitee_email: invitation.invitee_email
            });

            if (invitation.invitee_email !== email) {
                throw new Error('Email does not match the invitation');
            }

            if (invitation.is_used === true) {
                throw new Error('Referral link has already been used');
            }

            if (new Date(invitation.expires_at) <= new Date()) {
                throw new Error('Referral link has expired');
            }

            const existingUser = await sql`SELECT id FROM login WHERE email = ${email}`;

            if (existingUser.length > 0) {
                throw new Error('User already exists with this email');
            }

            try {
                // Create user account - handle sequence issues
                const userResult = await sql`
                    INSERT INTO login (email, password, referred_by) 
                    VALUES (${email}, ${password}, ${invitation.referrer_email}) 
                    RETURNING id, email
                `;

                // Mark invitation as used
                await sql`
                    UPDATE referral_invitations 
                    SET is_used = TRUE, used_at = NOW() 
                    WHERE token = ${token}
                `;

                console.log('✅ Backend: Registration completed successfully for:', email);
                return userResult[0];

            } catch (insertError) {
                // Handle duplicate key errors
                if (insertError.code === '23505' && insertError.constraint === 'login_pkey') {
                    console.error('❌ Primary key sequence out of sync, fixing...');
                    
                    // Fix sequence and retry
                    await sql`SELECT setval('login_id_seq', (SELECT MAX(id) FROM login) + 1)`;

                    // Retry the insert
                    const retryResult = await sql`
                        INSERT INTO login (email, password, referred_by) 
                        VALUES (${email}, ${password}, ${invitation.referrer_email}) 
                        RETURNING id, email
                    `;

                    await sql`
                        UPDATE referral_invitations 
                        SET is_used = TRUE, used_at = NOW() 
                        WHERE token = ${token}
                    `;

                    console.log('✅ Backend: Registration completed after sequence fix for:', email);
                    return retryResult[0];
                } else {
                    throw insertError;
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Registration completed successfully'
        });

    } catch (error) {
        console.error('❌ Backend: Registration error:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// NEW: Invalidate invitation on browser close
export const invalidateInvitation = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }

        console.log('🚫 Invalidating invitation token:', token.substring(0, 20) + '...');

        // Mark invitation as used to prevent future access
        const result = await db`
            UPDATE referral_invitations 
            SET is_used = TRUE, used_at = NOW() 
            WHERE token = ${token} 
            AND is_used = FALSE
            RETURNING id
        `;

        if (result.length > 0) {
            console.log('✅ Invitation invalidated successfully');
            return res.status(200).json({
                success: true,
                message: 'Invitation invalidated'
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found or already used'
            });
        }

    } catch (error) {
        console.error('❌ Error invalidating invitation:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to invalidate invitation'
        });
    }
};

// NEW: Heartbeat to track activity
export const invitationHeartbeat = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }

        // Update last_activity timestamp
        const result = await db`
            UPDATE referral_invitations 
            SET last_activity = NOW() 
            WHERE token = ${token} 
            AND is_used = FALSE
            RETURNING id
        `;

        return res.status(200).json({ 
            success: true,
            updated: result.length > 0 
        });
    } catch (error) {
        console.error('Heartbeat error:', error);
        return res.status(500).json({ success: false });
    }
};

// NEW: Cleanup inactive invitations
export const cleanupInactiveInvitations = async () => {
    try {
        const result = await db`
            UPDATE referral_invitations 
            SET is_used = TRUE, used_at = NOW() 
            WHERE is_used = FALSE 
            AND last_activity < NOW() - INTERVAL '2 minutes'
            RETURNING token
        `;

        console.log(`🧹 Cleaned up ${result.length} inactive invitations`);
        return result.length;
    } catch (error) {
        console.error('Cleanup error:', error);
        throw error;
    }
};

// Utility functions
export const getReferralStats = async (referrerEmail) => {
    try {
        const stats = await db`
            SELECT 
                COUNT(*) as total_invitations,
                COUNT(CASE WHEN is_used = TRUE THEN 1 END) as successful_referrals,
                COUNT(CASE WHEN is_used = FALSE AND expires_at > NOW() THEN 1 END) as pending_invitations,
                COUNT(CASE WHEN is_used = FALSE AND expires_at <= NOW() THEN 1 END) as expired_invitations
            FROM referral_invitations 
            WHERE referrer_email = ${referrerEmail}
        `;
        
        return stats[0];
    } catch (error) {
        console.error('Error getting referral stats:', error);
        throw error;
    }
};

export const cleanupExpiredInvitations = async () => {
    try {
        const result = await db`
            DELETE FROM referral_invitations 
            WHERE expires_at < NOW() AND is_used = FALSE
        `;
        
        console.log(`🧹 Cleaned up ${result.count} expired invitations`);
        return result.count;
    } catch (error) {
        console.error('Error cleaning up expired invitations:', error);
        throw error;
    }
};
