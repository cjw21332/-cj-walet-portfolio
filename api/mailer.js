const tls = require('tls');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.maileroo.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);

function redactAddress(address) {
    const value = address && typeof address === 'object' ? address.address : address;
    if (!value || typeof value !== 'string') return '[missing]';
    const atIndex = value.lastIndexOf('@');
    if (atIndex <= 0) return '[invalid email]';
    const localPart = value.slice(0, atIndex);
    return `${localPart.slice(0, 2)}${'*'.repeat(Math.max(1, localPart.length - 2))}${value.slice(atIndex)}`;
}

function getAddress(address) {
    return address && typeof address === 'object' ? address.address : address;
}

function getDisplayName(address) {
    return address && typeof address === 'object' ? address.display_name : '';
}

function logSmtpConfiguration(from) {
    const username = process.env.SMTP_USERNAME;
    const password = process.env.SMTP_PASSWORD;

    console.info('[Maileroo SMTP] Environment check:', {
        host: SMTP_HOST,
        port: SMTP_PORT,
        usernameDefined: username !== undefined,
        usernamePresent: typeof username === 'string' && username.trim().length > 0,
        passwordDefined: password !== undefined,
        passwordPresent: typeof password === 'string' && password.length > 0,
        fromAddress: redactAddress(from)
    });
}

function readResponse(socket) {
    return new Promise((resolve, reject) => {
        let data = '';

        const onData = (chunk) => {
            data += chunk.toString();
            const lines = data.split('\r\n');
            const lastCompleteLine = lines[lines.length - 2] || '';

            if (/^\d{3} /.test(lastCompleteLine)) {
                socket.removeListener('data', onData);
                resolve({ code: Number(lastCompleteLine.slice(0, 3)), body: data.trim() });
            }
        };

        socket.on('data', onData);
        socket.once('error', reject);
    });
}

async function command(socket, value, expectedCodes) {
    socket.write(`${value}\r\n`);
    const response = await readResponse(socket);

    console.info('[Maileroo SMTP] Response:', {
        command: value.split(' ')[0],
        statusCode: response.code,
        body: response.body
    });

    if (!expectedCodes.includes(response.code)) {
        throw new Error(`SMTP ${value.split(' ')[0]} failed with ${response.code}: ${response.body}`);
    }
}

function createMessage(mail) {
    const from = getAddress(mail.from);
    const fromName = getDisplayName(mail.from);
    const to = getAddress(mail.to[0]);
    const toName = getDisplayName(mail.to[0]);
    const boundary = `portfolio-${Date.now()}`;
    const encodedSubject = `=?UTF-8?B?${Buffer.from(mail.subject).toString('base64')}?=`;
    const htmlPart = Buffer.from(mail.html).toString('base64').match(/.{1,76}/g).join('\r\n');
    const plainPart = Buffer.from(mail.plain).toString('base64').match(/.{1,76}/g).join('\r\n');

    return [
        `From: ${fromName ? `"${fromName}" ` : ''}<${from}>`,
        `To: ${toName ? `"${toName}" ` : ''}<${to}>`,
        `Subject: ${encodedSubject}`,
        'MIME-Version: 1.0',
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        '',
        plainPart,
        `--${boundary}`,
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        '',
        htmlPart,
        `--${boundary}--`,
        ''
    ].join('\r\n');
}

async function sendMail(mail) {
    console.info('[Maileroo SMTP] Request payload metadata:', {
        from: redactAddress(mail.from),
        to: mail.to.map(redactAddress),
        subject: mail.subject
    });
    logSmtpConfiguration(mail.from);

    const username = process.env.SMTP_USERNAME;
    const password = process.env.SMTP_PASSWORD;
    if (!username || !password) {
        throw new Error('SMTP_USERNAME and SMTP_PASSWORD must be configured.');
    }

    const socket = tls.connect({
        host: SMTP_HOST,
        port: SMTP_PORT,
        servername: SMTP_HOST,
        rejectUnauthorized: true
    });

    try {
        await readResponse(socket);
        await command(socket, `EHLO ${SMTP_HOST}`, [250]);
        await command(socket, 'AUTH LOGIN', [334]);
        await command(socket, Buffer.from(username).toString('base64'), [334]);
        await command(socket, Buffer.from(password).toString('base64'), [235]);
        await command(socket, `MAIL FROM:<${getAddress(mail.from)}>`, [250]);

        for (const recipient of mail.to) {
            await command(socket, `RCPT TO:<${getAddress(recipient)}>`, [250, 251]);
        }

        await command(socket, 'DATA', [354]);
        const message = createMessage(mail)
            .split('\r\n')
            .map(line => line.startsWith('.') ? `.${line}` : line)
            .join('\r\n');
        socket.write(`${message}\r\n.\r\n`);
        await readResponse(socket).then((response) => {
            if (response.code !== 250) {
                throw new Error(`SMTP DATA failed with ${response.code}: ${response.body}`);
            }
        });
        await command(socket, 'QUIT', [221]);
    } finally {
        socket.end();
    }
}

module.exports = { sendMail };
