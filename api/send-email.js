const { createClientAutoReply } = require('./emailTemplates/autoReplyClient');
const { createOwnerNotification } = require('./emailTemplates/notifyOwner');
const { sendMail } = require('./mailer');

module.exports = async (req, res) => {
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

    const fromEmail = process.env.MAILEROO_FROM_EMAIL;
    if (!fromEmail) {
        return res.status(500).json({ error: 'Mail service is not configured.' });
    }

    const timestamp = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Manila'
    });
    const ownerEmail = 'waletcharlesjames3@gmail.com';
    const commonMail = {
        from: {
            address: fromEmail,
            display_name: 'CJ Walet | IT Portfolio'
        }
    };
    const notify = createOwnerNotification({ name, email, message, timestamp });
    const autoReply = createClientAutoReply({ name });

    try {
        await Promise.all([
            sendMail({
                ...commonMail,
                to: [{ address: ownerEmail, display_name: 'Charles James Walet' }],
                reply_to: { address: email },
                ...notify
            }),
            sendMail({
                ...commonMail,
                to: [{ address: email, display_name: name }],
                ...autoReply
            })
        ]);

        return res.status(200).json({ success: true, message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Maileroo delivery failed:', error);
        return res.status(502).json({
            error: 'Maileroo did not accept the email request.',
            detail: 'See the server logs for the provider response.'
        });
    }
};
