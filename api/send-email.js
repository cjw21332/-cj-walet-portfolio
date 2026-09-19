const { sendMail } = require('./mailer');

module.exports = async (req, res) => {
    // Set CORS headers for serverless response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, Email, and Message are required.' });
    }

    const API_KEY = process.env.MAILEROO_API_KEY;
    const FROM_EMAIL = process.env.MAILEROO_FROM_EMAIL;

    if (!API_KEY || !FROM_EMAIL) {
        return res.status(500).json({ error: 'Mail service is not configured.' });
    }

    // 1. Notification Email to CJ
    const escapeHtml = (value) => value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    const notifyPayload = {
        from: {
            address: FROM_EMAIL,
            display_name: "Portfolio Inquiry System"
        },
        to: [
            {
                address: "waletcharlesjames3@gmail.com",
                display_name: "CHARLES JAMES WALET"
            }
        ],
        subject: `New Portfolio Message from ${name}`,
        plain: `You received a new message from your portfolio contact form:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background: #f8fafc; border-radius: 8px;">
            <h2 style="color: #0265dc;">New Portfolio Contact Message</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">${safeMessage}</p>
        </div>`
    };

    // 2. Personalized Auto-Reply to Visitor
    const autoReplyPayload = {
        from: {
            address: FROM_EMAIL,
            display_name: "CHARLES JAMES “CJ” J. WALET"
        },
        to: [
            {
                address: email,
                display_name: name
            }
        ],
        subject: `Thank you for contacting Charles James Walet`,
        plain: `Hi ${name},\n\nThank you for reaching out to me about your concerns!\n\nI have received your message and I will be replying/emailing back to you within the next 24 hours.\n\nBest regards,\nCHARLES JAMES “CJ” J. WALET\n4th Year BSIT Student & IT Technician Intern\nQuezon City University`,
        html: `<div style="font-family: Arial, sans-serif; padding: 25px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; max-width: 600px;">
            <h2 style="color: #0265dc; margin-top: 0;">Thank You for Reaching Out</h2>
            <p>Hi <strong>${safeName}</strong>,</p>
            <p>Thank you for reaching out to me about your concerns!</p>
            <p>I have received your message and I will be replying/emailing back to you within the next <strong>24 hours</strong>.</p>
            <br>
            <p style="margin-bottom: 0;">Best regards,</p>
            <p style="margin-top: 4px;"><strong>CHARLES JAMES “CJ” J. WALET</strong><br><span style="color: #64748b; font-size: 14px;">4th Year BSIT Student &amp; IT Technician Intern<br>Quezon City University</span></p>
        </div>`
    };

    try {
        const results = await Promise.all([
            sendMail({ apiKey: API_KEY, ...notifyPayload }),
            sendMail({ apiKey: API_KEY, ...autoReplyPayload })
        ]);

        if (results.some(result => !result)) {
            return res.status(502).json({ error: 'Mail service did not accept the message.' });
        }

        return res.status(200).json({ success: true, message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Maileroo delivery failed:', error);
        return res.status(502).json({
            error: 'Maileroo did not accept the email request.',
            detail: 'See the server logs for the Maileroo response.'
        });
    }
};
