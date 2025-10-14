const { logger } = require('../middleware/logger');
const { config } = require('../config/env');
const N8NService = require('./n8nService');

class EmailService {
  static async sendWelcomeEmail(userData) {
    try {
      const { email, fullName, username } = userData;
      
      if (!email) {
        logger.warn('No email provided for welcome email');
        return { success: false, message: 'No email provided' };
      }

      const name = fullName || username || 'User';
      
      // HTML template (readable format)
      const htmlTemplate = `<!doctype html>
<html lang='en'>
<head>
  <meta charset='utf-8'>
  <title>Welcome to MuseMusic</title>
</head>
<body style='font-family:Segoe UI,Arial,sans-serif;background:#f6f7fb;margin:0;padding:40px 0;'>
  <table align='center' width='600' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:16px;box-shadow:0 6px 25px rgba(0,0,0,0.05);overflow:hidden;'>
    <tr>
      <td align='center' style='padding:36px 24px;background:#111827;'>
        <h2 style='color:#ffffff;margin:0;font-size:22px;letter-spacing:0.5px;'>MUSE MUSIC</h2>
        <p style='color:#9ca3af;margin:6px 0 0;font-size:13px;font-style:italic;'>"Because music means more than sound."</p>
      </td>
    </tr>
    <tr>
      <td style='padding:40px 32px;text-align:center;color:#111827;'>
        <!-- Welcome Header -->
        <div style='margin-bottom:32px;'>
          <h2 style='margin:0 0 8px;font-size:28px;font-weight:700;color:#1f2937;'>🎉 Welcome to MuseMusic!</h2>
          <p style='margin:0;font-size:16px;color:#6b7280;'>Hi ${name}, your account is ready</p>
        </div>
        
        <!-- Success Message -->
        <div style='background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:24px;margin-bottom:32px;'>
          <div style='font-size:48px;margin-bottom:16px;'>🎶</div>
          <h3 style='margin:0 0 12px;font-size:20px;color:#0369a1;font-weight:600;'>Account Created Successfully!</h3>
          <p style='margin:0;font-size:15px;color:#0c4a6e;line-height:1.6;'>Welcome to <strong>MuseMusic</strong> — where music and inspiration come together in perfect harmony.</p>
        </div>
        
        <!-- Action Section -->
        <div style='margin-bottom:32px;'>
          <p style='margin:0 0 24px;font-size:16px;color:#374151;font-weight:500;'>Ready to start your musical journey?</p>
          <a href='${config.frontend.url}/login' target='_blank' style='background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:600;display:inline-block;font-size:16px;box-shadow:0 4px 15px rgba(102, 126, 234, 0.3);transition:all 0.3s ease;'>🚀 Get Started Now</a>
        </div>
        
        <!-- Features Preview -->
        <div style='background:#f8fafc;border-radius:12px;padding:24px;margin-bottom:32px;'>
          <h4 style='margin:0 0 16px;font-size:18px;color:#1f2937;font-weight:600;'>What's waiting for you:</h4>
          <div style='display:flex;justify-content:space-around;flex-wrap:wrap;gap:16px;'>
            <div style='text-align:center;flex:1;min-width:120px;'>
              <div style='font-size:24px;margin-bottom:8px;'>🎵</div>
              <p style='margin:0;font-size:14px;color:#6b7280;font-weight:500;'>Discover Music</p>
            </div>
            <div style='text-align:center;flex:1;min-width:120px;'>
              <div style='font-size:24px;margin-bottom:8px;'>🤖</div>
              <p style='margin:0;font-size:14px;color:#6b7280;font-weight:500;'>AI Analysis</p>
            </div>
            <div style='text-align:center;flex:1;min-width:120px;'>
              <div style='font-size:24px;margin-bottom:8px;'>📝</div>
              <p style='margin:0;font-size:14px;color:#6b7280;font-weight:500;'>Create Playlists</p>
            </div>
            <div style='text-align:center;flex:1;min-width:120px;'>
              <div style='font-size:24px;margin-bottom:8px;'>😊</div>
              <p style='margin:0;font-size:14px;color:#6b7280;font-weight:500;'>Mood Analysis</p>
            </div>
            <div style='text-align:center;flex:1;min-width:120px;'>
              <div style='font-size:24px;margin-bottom:8px;'>🌍</div>
              <p style='margin:0;font-size:14px;color:#6b7280;font-weight:500;'>Translation</p>
            </div>
            <div style='text-align:center;flex:1;min-width:120px;'>
              <div style='font-size:24px;margin-bottom:8px;'>⭐</div>
              <p style='margin:0;font-size:14px;color:#6b7280;font-weight:500;'>Rate & Review</p>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <hr style='border:none;border-top:1px solid #e5e7eb;margin:32px 0 24px;'>
        <p style='margin:0;color:#9ca3af;font-size:13px;line-height:1.5;'>If you didn't create this account, you can safely ignore this email.<br>Questions? Reply to this email and we'll help you out!</p>
      </td>
    </tr>
    <tr>
      <td style='padding:20px 28px;text-align:center;color:#9ca3af;font-size:12px;border-top:1px solid #f3f4f6;'>
        © 2025 MuseMusic · phitik.com<br>
        <a href='#' style='color:#9ca3af;text-decoration:underline;'>Unsubscribe</a>
      </td>
    </tr>
  </table>
</body>
</html>`;

      // Convert to N8N format
      const emailData = {
        subject: "🎉 Welcome to MuseMusic – Your account is ready!",
        to: email,
        message: htmlTemplate.replace(/\s+/g, ' ').trim() // Minify HTML
      };

      // Check if N8N webhook is configured
      if (!process.env.EMAIL_N8N_WEBHOOK_URL) {
        logger.warn('N8N webhook URL not configured, skipping welcome email');
        return { 
          success: true, 
          message: 'Welcome email skipped (N8N not configured)',
          data: { email, skipped: true }
        };
      }

      const result = await N8NService.sendEmailWebhook(emailData);
      
      if (result.success) {
        logger.info('Welcome email sent successfully:', { email, result });
        return result;
      } else {
        throw new Error(result.error || 'Failed to send email');
      }

    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      return { 
        success: false, 
        message: 'Failed to send welcome email',
        error: error.message 
      };
    }
  }

  static async sendEmail(subject, to, message) {
    try {
      const emailData = {
        subject,
        to,
        message
      };

      // Check if N8N webhook is configured
      if (!process.env.EMAIL_N8N_WEBHOOK_URL) {
        logger.warn('N8N webhook URL not configured, skipping email');
        return { 
          success: true, 
          message: 'Email skipped (N8N not configured)',
          data: { to, subject, skipped: true }
        };
      }

      const result = await N8NService.sendEmailWebhook(emailData);
      
      if (result.success) {
        logger.info('Email sent successfully:', { to, subject, result });
        return result;
      } else {
        throw new Error(result.error || 'Failed to send email');
      }

    } catch (error) {
      logger.error('Failed to send email:', error);
      return { 
        success: false, 
        message: 'Failed to send email',
        error: error.message 
      };
    }
  }

  static async sendPasswordResetEmail(userData) {
    try {
      const { email, fullName, resetLink } = userData;
      
      if (!email || !resetLink) {
        logger.warn('Missing email or reset link for password reset email');
        return { success: false, message: 'Missing required data' };
      }

      const name = fullName || 'User';
      
      // HTML template for password reset email
      const htmlTemplate = `<!doctype html>
<html lang='en'>
<head>
  <meta charset='utf-8'>
  <title>Reset Your Password - MuseMusic</title>
</head>
<body style='font-family:Segoe UI,Arial,sans-serif;background:#f6f7fb;margin:0;padding:40px 0;'>
  <table align='center' width='600' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:16px;box-shadow:0 6px 25px rgba(0,0,0,0.05);overflow:hidden;'>
    <tr>
      <td align='center' style='padding:36px 24px;background:#111827;'>
        <h2 style='color:#ffffff;margin:0;font-size:22px;letter-spacing:0.5px;'>MUSE MUSIC</h2>
        <p style='color:#9ca3af;margin:6px 0 0;font-size:13px;font-style:italic;'>"Because music means more than sound."</p>
      </td>
    </tr>
    <tr>
      <td style='padding:40px 32px;text-align:center;color:#111827;'>
        <!-- Reset Header -->
        <div style='margin-bottom:32px;'>
          <h2 style='margin:0 0 8px;font-size:28px;font-weight:700;color:#1f2937;'>🔐 Reset Your Password</h2>
          <p style='margin:0;font-size:16px;color:#6b7280;'>Hi ${name}, we received a request to reset your password</p>
        </div>
        
        <!-- Reset Message -->
        <div style='background:#fef3c7;border:1px solid #f59e0b;border-radius:12px;padding:24px;margin-bottom:32px;'>
          <div style='font-size:48px;margin-bottom:16px;'>🔑</div>
          <h3 style='margin:0 0 12px;font-size:20px;color:#92400e;font-weight:600;'>Password Reset Request</h3>
          <p style='margin:0;font-size:15px;color:#92400e;line-height:1.6;'>Click the button below to reset your password. This link will expire in <strong>1 hour</strong> for security reasons.</p>
        </div>
        
        <!-- Reset Button -->
        <div style='margin-bottom:32px;'>
          <a href='${resetLink}' target='_blank' style='background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:600;display:inline-block;font-size:16px;box-shadow:0 4px 15px rgba(239, 68, 68, 0.3);transition:all 0.3s ease;'>🔐 Reset My Password</a>
        </div>
        
        <!-- Security Notice -->
        <div style='background:#f8fafc;border-radius:12px;padding:24px;margin-bottom:32px;'>
          <h4 style='margin:0 0 16px;font-size:18px;color:#1f2937;font-weight:600;'>🛡️ Security Notice</h4>
          <div style='text-align:left;color:#6b7280;font-size:14px;line-height:1.6;'>
            <p style='margin:0 0 12px;'>• This link expires in 1 hour</p>
            <p style='margin:0 0 12px;'>• If you didn't request this reset, please ignore this email</p>
            <p style='margin:0;'>• Your password will remain unchanged until you click the link</p>
          </div>
        </div>
        
        <!-- Footer -->
        <hr style='border:none;border-top:1px solid #e5e7eb;margin:32px 0 24px;'>
        <p style='margin:0;color:#9ca3af;font-size:13px;line-height:1.5;'>If the button doesn't work, copy and paste this link into your browser:<br><a href='${resetLink}' style='color:#3b82f6;word-break:break-all;'>${resetLink}</a></p>
      </td>
    </tr>
    <tr>
      <td style='padding:20px 28px;text-align:center;color:#9ca3af;font-size:12px;border-top:1px solid #f3f4f6;'>
        © 2025 MuseMusic · phitik.com<br>
        <a href='#' style='color:#9ca3af;text-decoration:underline;'>Unsubscribe</a>
      </td>
    </tr>
  </table>
</body>
</html>`;

      // Convert to N8N format
      const emailData = {
        subject: "🔐 Reset Your MuseMusic Password",
        to: email,
        message: htmlTemplate.replace(/\s+/g, ' ').trim() // Minify HTML
      };

      // Check if N8N webhook is configured
      if (!process.env.EMAIL_N8N_WEBHOOK_URL) {
        logger.warn('N8N webhook URL not configured, skipping password reset email');
        return { 
          success: true, 
          message: 'Password reset email skipped (N8N not configured)',
          data: { email, skipped: true }
        };
      }

      const result = await N8NService.sendEmailWebhook(emailData);
      
      if (result.success) {
        logger.info('Password reset email sent successfully:', { email, result });
        return result;
      } else {
        throw new Error(result.error || 'Failed to send email');
      }

    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      return { 
        success: false, 
        message: 'Failed to send password reset email',
        error: error.message 
      };
    }
  }
}

module.exports = EmailService;
