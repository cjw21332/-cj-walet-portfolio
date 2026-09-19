const {
    GITHUB_URL,
    LINKEDIN_URL,
    PORTFOLIO_NAME,
    PORTFOLIO_ROLE,
    createFooter,
    createHeader,
    createLayout,
    escapeHtml
} = require('./shared');

function createClientAutoReply({ name }) {
    const safeName = escapeHtml(name);

    return {
        subject: `Thanks for reaching out to ${PORTFOLIO_NAME}`,
        plain: `Hi ${name},\n\nThank you for reaching out to ${PORTFOLIO_NAME}. Your inquiry has been received successfully.\n\nI will review your message and reply within the next 24 to 48 hours.\n\nWhile you wait:\nGitHub: ${GITHUB_URL}\nLinkedIn: ${LINKEDIN_URL}\nPortfolio: https://charlesjameswalet-portfolio.vercel.app\n\nBest regards,\nCJ Walet\n${PORTFOLIO_ROLE}`,
        html: createLayout(`
            ${createHeader('MESSAGE RECEIVED')}
            <tr>
                <td style="background-color:#FFFFFF;padding:32px;">
                    <div style="background-color:#FFFFFF;color:#1677FF;font-family:'Courier New',Courier,monospace;font-size:28px;font-weight:bold;line-height:32px;">✓</div>
                    <h1 style="background-color:#FFFFFF;color:#172033;font-family:Arial,Helvetica,sans-serif;font-size:25px;line-height:32px;margin:14px 0 8px;">Thank you for reaching out</h1>
                    <p style="background-color:#FFFFFF;color:#334155;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:25px;margin:0 0 12px;">Hi <strong style="background-color:#FFFFFF;color:#172033;">${safeName}</strong>,</p>
                    <p style="background-color:#FFFFFF;color:#475569;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:25px;margin:0;">Your inquiry has been received successfully. Thank you for taking the time to connect.</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#E8F5FF;border:1px solid #B9D9F5;margin-top:24px;">
                        <tr>
                            <td style="background-color:#E8F5FF;padding:16px 18px;">
                                <div style="background-color:#E8F5FF;color:#075985;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;"><strong style="background-color:#E8F5FF;color:#075985;">Response time:</strong> I will reply within the next 24 to 48 hours.</div>
                            </td>
                        </tr>
                    </table>
                    <div style="background-color:#FFFFFF;color:#64748B;font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:1px;line-height:18px;padding-top:28px;">WHILE YOU WAIT</div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:10px;">
                        <tr>
                            <td width="33%" style="background-color:#F8FAFC;border:1px solid #E2E8F0;padding:12px 8px;text-align:center;"><a href="${GITHUB_URL}" style="background-color:#F8FAFC;color:#0369A1;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;text-decoration:none;">GitHub</a></td>
                            <td width="4%" style="background-color:#FFFFFF;font-size:1px;">&nbsp;</td>
                            <td width="33%" style="background-color:#F8FAFC;border:1px solid #E2E8F0;padding:12px 8px;text-align:center;"><a href="${LINKEDIN_URL}" style="background-color:#F8FAFC;color:#0369A1;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;text-decoration:none;">LinkedIn</a></td>
                            <td width="4%" style="background-color:#FFFFFF;font-size:1px;">&nbsp;</td>
                            <td width="33%" style="background-color:#F8FAFC;border:1px solid #E2E8F0;padding:12px 8px;text-align:center;"><a href="https://charlesjameswalet-portfolio.vercel.app/#projects" style="background-color:#F8FAFC;color:#0369A1;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;text-decoration:none;">Projects</a></td>
                        </tr>
                    </table>
                    <p style="background-color:#FFFFFF;color:#334155;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;margin:28px 0 0;">Best regards,<br><strong style="background-color:#FFFFFF;color:#172033;">CJ Walet</strong><br><span style="background-color:#FFFFFF;color:#64748B;">${PORTFOLIO_ROLE}</span></p>
                </td>
            </tr>
            ${createFooter()}`)
    };
}

module.exports = { createClientAutoReply };
