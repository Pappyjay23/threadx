export function createWelcomeEmailTemplate(
	userName: string,
	clientURL: string,
) {
	// You can also add check to ensure the email template is safe from HTML injection.
	return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ThreadX</title>
    <style>
      @media only screen and (max-width: 600px) {
        body { padding: 10px !important; }
        .container { max-width: 100% !important; }
        .btn { padding: 10px 20px !important; }
      }
    </style>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #060415;">
    <div class="container" style="background: linear-gradient(to right, #9e7ffb, #7556d3); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; box-shadow: 0 4px 20px rgba(117, 86, 211, 0.3);">
      <img src="${clientURL}/logo.png" alt="ThreadX Logo" style="width: 80px; height: 80px; margin-bottom: 20px; border-radius: 16px; background-color: rgba(255,255,255,0.1); padding: 10px; object-fit: contain;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Welcome to ThreadX!</h1>
    </div>
    <div style="background-color: #0e0b24; color: #fff; font-weight: 300; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
      <p style="font-size: 18px;">Hello ${userName},</p>
      <p>We're excited to have you join our messaging platform! ThreadX connects you with friends, family, and colleagues in real-time, no matter where they are.</p>
      
      <div style="background-color: #0c0926; color: #fff; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #7556d3;">
        <p style="font-size: 16px; margin: 0 0 15px 0;"><strong>Get started in just a few steps:</strong></p>
        <ul style="padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 10px;">Set up your profile picture</li>
          <li style="margin-bottom: 10px;">Find and add your contacts</li>
          <li style="margin-bottom: 10px;">Start a conversation</li>
          <li style="margin-bottom: 0;">Share photos, videos, and more</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${clientURL}" class="btn" style="background: linear-gradient(to right, #7556d3, #9e7ffb); color: white; text-decoration: none; padding: 12px 30px; border-radius: 50px; font-weight: 300; display: inline-block; box-shadow: 0 4px 15px rgba(117, 86, 211, 0.3); transition: all 0.3s ease;">Open ThreadX</a>
      </div>
      
      <p style="margin-bottom: 5px;">If you need any help or have questions, we're always here to assist you.</p>
      <p style="margin-top: 0;">Happy messaging!</p>
      
      <p style="margin-top: 25px; margin-bottom: 0;">Best regards,<br>The ThreadX Team</p>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #9e7ffb; font-size: 12px; font-weight: 300;">
      <p>© 2026 ThreadX. All rights reserved.</p>
      <p>
        <a href="#" style="color: #9e7ffb; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
        <a href="#" style="color: #9e7ffb; text-decoration: none; margin: 0 10px;">Terms of Service</a>
        <a href="#" style="color: #9e7ffb; text-decoration: none; margin: 0 10px;">Contact Us</a>
      </p>
    </div>
  </body>
  </html>
  `;
}
