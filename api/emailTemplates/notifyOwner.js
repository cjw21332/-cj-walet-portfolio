const {
    PORTFOLIO_NAME,
    createFooter,
    createHeader,
    createLayout,
    escapeHtml
} = require('./shared');

function createOwnerNotification({ name, email, message, timestamp }) {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);
    const safeTimestamp = escapeHtml(timestamp);

    return {
        subject: `New contact inquiry from ${String(name).replace(/[\r\n]+/g, ' ').trim().slice(0, 100)}`,
        plain: `${PORTFOLIO_NAME}\nNEW CONTACT INQUIRY\n\nName: ${name}\nEmail: ${email}\nSubmitted: ${timestamp}\n\nMessage:\n${message}\n\nReply directly to ${email} to respond.`,
        html: createLayout(`
            ${createHeader('NEW CONTACT INQUIRY')}
            <tr>
                <td style="background-color:#FFFFFF;padding:32px;">
                    <h1 style="background-color:#FFFFFF;color:#172033;font-family:Arial,Helvetica,sans-serif;font-size:25px;line-height:32px;margin:0 0 8px;">A new message arrived</h1>
                    <p style="background-color:#FFFFFF;color:#64748B;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;margin:0 0 24px;">A visitor submitted an inquiry through your portfolio.</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#F1F5F9;border:1px solid #D7E3F2;">
                        <tr>
                            <td style="background-color:#F1F5F9;padding:18px 20px;">
                                <div style="background-color:#F1F5F9;color:#64748B;font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:1px;line-height:18px;">SENDER DETAILS</div>
                                <div style="background-color:#F1F5F9;color:#172033;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;line-height:22px;padding-top:8px;">${safeName}</div>
                                <a href="mailto:${safeEmail}" style="background-color:#F1F5F9;color:#0369A1;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;text-decoration:none;">${safeEmail}</a>
                            </td>
                        </tr>
                    </table>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#FFFFFF;margin-top:24px;">
                        <tr>
                            <td style="background-color:#FFFFFF;border-left:4px solid #1677FF;padding:4px 0 4px 18px;">
                                <div style="background-color:#FFFFFF;color:#64748B;font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:1px;line-height:18px;">MESSAGE</div>
                                <div style="background-color:#FFFFFF;color:#334155;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:25px;padding-top:8px;white-space:pre-wrap;">${safeMessage}</div>
                            </td>
                        </tr>
                    </table>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
                        <tr>
                            <td style="background-color:#1677FF;border-radius:5px;">
                                <a href="mailto:${safeEmail}?subject=Re:%20Your%20inquiry%20to%20${encodeURIComponent(PORTFOLIO_NAME)}" style="display:inline-block;background-color:#1677FF;border:1px solid #1677FF;border-radius:5px;color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;line-height:20px;padding:12px 18px;text-decoration:none;">Reply to ${safeName}</a>
                            </td>
                        </tr>
                    </table>
                    <div style="background-color:#FFFFFF;color:#94A3B8;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;padding-top:24px;">Submitted ${safeTimestamp}</div>
                </td>
            </tr>
            ${createFooter()}`)
    };
}

module.exports = { createOwnerNotification };
