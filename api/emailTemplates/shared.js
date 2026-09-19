const PORTFOLIO_NAME = 'CJ Walet | IT Portfolio';
const PORTFOLIO_ROLE = 'IT Student & Aspiring Full-Stack Developer';
const PORTFOLIO_URL = 'https://charlesjameswalet-portfolio.vercel.app';
const GITHUB_URL = 'https://github.com/cjw21332';
const LINKEDIN_URL = process.env.PORTFOLIO_LINKEDIN_URL || 'https://www.linkedin.com/';

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function cleanSubjectPart(value) {
    return String(value || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 100);
}

function createHeader(eyebrow) {
    return `
        <tr>
            <td style="background-color:#0A1628;padding:30px 32px 26px;border-bottom:4px solid #1677FF;">
                <div style="background-color:#0A1628;color:#22D3EE;font-family:'Courier New',Courier,monospace;font-size:16px;font-weight:bold;letter-spacing:1px;line-height:24px;">&lt; CJW /&gt;</div>
                <div style="background-color:#0A1628;color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:bold;line-height:32px;padding-top:10px;">${PORTFOLIO_NAME}</div>
                <div style="background-color:#0A1628;color:#B8C7DC;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;padding-top:4px;">${PORTFOLIO_ROLE}</div>
                <div style="background-color:#0A1628;color:#62A8FF;font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:bold;letter-spacing:2px;line-height:18px;padding-top:18px;">${eyebrow}</div>
            </td>
        </tr>`;
}

function createFooter() {
    return `
        <tr>
            <td style="background-color:#F1F5F9;padding:22px 32px;border-top:1px solid #D7E3F2;">
                <div style="background-color:#F1F5F9;color:#0F172A;font-family:'Courier New',Courier,monospace;font-size:13px;font-weight:bold;line-height:20px;">&lt; CJW /&gt; ${PORTFOLIO_NAME}</div>
                <div style="background-color:#F1F5F9;color:#64748B;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;padding-top:5px;">Quezon City, Philippines · <a href="${PORTFOLIO_URL}" style="background-color:#F1F5F9;color:#0369A1;text-decoration:none;">View portfolio</a></div>
                <div style="background-color:#F1F5F9;padding-top:10px;">
                    <a href="${GITHUB_URL}" style="background-color:#F1F5F9;color:#0369A1;font-family:'Courier New',Courier,monospace;font-size:11px;text-decoration:none;">[GH] GitHub</a>
                    <span style="background-color:#F1F5F9;color:#CBD5E1;font-family:Arial,Helvetica,sans-serif;font-size:11px;"> &nbsp;·&nbsp; </span>
                    <a href="${LINKEDIN_URL}" style="background-color:#F1F5F9;color:#0369A1;font-family:'Courier New',Courier,monospace;font-size:11px;text-decoration:none;">[in] LinkedIn</a>
                    <span style="background-color:#F1F5F9;color:#CBD5E1;font-family:Arial,Helvetica,sans-serif;font-size:11px;"> &nbsp;·&nbsp; </span>
                    <a href="mailto:waletcharlesjames3@gmail.com" style="background-color:#F1F5F9;color:#0369A1;font-family:'Courier New',Courier,monospace;font-size:11px;text-decoration:none;">[@] Email</a>
                </div>
                <div style="background-color:#F1F5F9;color:#94A3B8;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;padding-top:8px;">Sent via the CJ Walet portfolio contact form.</div>
            </td>
        </tr>`;
}

function createLayout(content) {
    return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background-color:#EAF0F7;color:#172033;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#EAF0F7;">
        <tr>
            <td align="center" style="background-color:#EAF0F7;padding:24px 12px;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#FFFFFF;border:1px solid #D7E3F2;">
                    ${content}
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

module.exports = {
    GITHUB_URL,
    LINKEDIN_URL,
    PORTFOLIO_NAME,
    PORTFOLIO_ROLE,
    PORTFOLIO_URL,
    cleanSubjectPart,
    createFooter,
    createHeader,
    createLayout,
    escapeHtml
};
