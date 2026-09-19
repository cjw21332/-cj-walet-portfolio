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

    const FROM_EMAIL = process.env.MAILEROO_FROM_EMAIL;

    if (!FROM_EMAIL) {
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
    const portfolioName = 'CJ Walet | IT Portfolio';
    const portfolioRole = 'IT Student & Aspiring Full-Stack Developer';
    const portfolioUrl = 'https://charlesjameswalet-portfolio.vercel.app';
    const emailSubjectName = name.replace(/[\r\n]+/g, ' ').trim();
    const brandedHeader = `
        <header style="padding: 28px 32px; background: linear-gradient(135deg, #06152d 0%, #0b2e5f 100%); color: #ffffff;">
            <div style="font-family: Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2px; color: #22d3ee;">&lt; CJ /&gt;</div>
            <div style="font-family: Arial, sans-serif; font-size: 22px; font-weight: 700; margin-top: 12px;">${portfolioName}</div>
            <div style="font-family: Arial, sans-serif; font-size: 13px; color: #cbd5e1; margin-top: 6px;">${portfolioRole}</div>
        </header>`;
    const brandedFooter = `
        <footer style="padding: 22px 32px; background: #f1f5f9; border-top: 1px solid #dbeafe; color: #64748b; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.6;">
            <strong style="color: #0f172a;">${portfolioName}</strong><br>
            Quezon City, Philippines · <a href="${portfolioUrl}" style="color: #0369a1; text-decoration: none;">View portfolio</a><br>
            This message was sent through the portfolio contact form.
        </footer>`;

    const notifyPayload = {
        from: {
            address: FROM_EMAIL,
            display_name: portfolioName
        },
        to: [
            {
                address: "waletcharlesjames3@gmail.com",
                display_name: "CHARLES JAMES WALET"
            }
        ],
        subject: `New portfolio inquiry from ${emailSubjectName}`,
        plain: `CJ Walet | IT Portfolio\nNew contact form inquiry\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\n${portfolioName}\n${portfolioRole}\n${portfolioUrl}`,
        html: `<div style="max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #dbeafe; border-radius: 12px; overflow: hidden;">
            ${brandedHeader}
            <main style="padding: 32px; color: #1e293b; font-family: Arial, sans-serif;">
                <div style="display: inline-block; padding: 6px 10px; border-radius: 999px; background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 700; letter-spacing: 1px;">NEW CONTACT INQUIRY</div>
                <h1 style="font-size: 26px; margin: 18px 0 8px; color: #0f172a;">A new message arrived</h1>
                <p style="margin: 0 0 24px; color: #64748b;">Someone has reached out through your IT portfolio.</p>
                <div style="padding: 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <p style="margin: 0 0 10px;"><strong>Name:</strong> ${safeName}</p>
                    <p style="margin: 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #0369a1;">${safeEmail}</a></p>
                </div>
                <h2 style="font-size: 16px; margin: 28px 0 10px; color: #0f172a;">Message</h2>
                <p style="white-space: pre-wrap; margin: 0; padding: 18px; background: #ffffff; border-left: 4px solid #06b6d4; color: #334155; line-height: 1.7;">${safeMessage}</p>
            </main>
            ${brandedFooter}
        </div>`
    };

    // 2. Personalized Auto-Reply to Visitor
    const autoReplyPayload = {
        from: {
            address: FROM_EMAIL,
            display_name: portfolioName
        },
        to: [
            {
                address: email,
                display_name: name
            }
        ],
        subject: `Thank you for contacting ${portfolioName}`,
        plain: `Hi ${name},\n\nThank you for contacting ${portfolioName}.\n\nYour message has been received successfully. I will review your inquiry and reply within the next 24 to 48 hours.\n\nBest regards,\nCJ Walet\n${portfolioRole}\nQuezon City, Philippines\n${portfolioUrl}`,
        html: `<div style="max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #dbeafe; border-radius: 12px; overflow: hidden;">
            ${brandedHeader}
            <main style="padding: 34px 32px; color: #1e293b; font-family: Arial, sans-serif;">
                <div style="font-size: 34px; line-height: 1; color: #06b6d4;">✓</div>
                <h1 style="font-size: 26px; margin: 18px 0 10px; color: #0f172a;">Thank you for reaching out</h1>
                <p style="font-size: 16px; line-height: 1.7; margin: 0 0 18px;">Hi <strong>${safeName}</strong>,</p>
                <p style="font-size: 15px; line-height: 1.7; color: #475569;">Your inquiry has been received successfully. Thank you for considering my services and taking the time to connect.</p>
                <div style="margin: 24px 0; padding: 18px; background: #ecfeff; border: 1px solid #a5f3fc; border-radius: 8px; color: #155e75; line-height: 1.7;"><strong>Response time:</strong> I will reply within the next 24 to 48 hours.</div>
                <p style="line-height: 1.7; margin-bottom: 0;">Best regards,<br><strong>CJ Walet</strong><br><span style="color: #64748b;">${portfolioRole}</span></p>
            </main>
            ${brandedFooter}
        </div>`
    };

    try {
        const results = await Promise.all([
            sendMail(notifyPayload),
            sendMail(autoReplyPayload)
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
