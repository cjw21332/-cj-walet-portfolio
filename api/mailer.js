const MAILEROO_ENDPOINT = 'https://smtp.maileroo.com/api/v2/emails';

function redactAddress(address) {
    if (Array.isArray(address)) {
        return address.map(redactAddress);
    }

    if (address && typeof address === 'object') {
        address = address.address;
    }

    if (!address || typeof address !== 'string') return '[missing]';
    const atIndex = address.lastIndexOf('@');
    if (atIndex <= 0) return '[invalid email]';

    const localPart = address.slice(0, atIndex);
    const domain = address.slice(atIndex + 1);
    return `${localPart.slice(0, 2)}${'*'.repeat(Math.max(1, localPart.length - 2))}@${domain}`;
}

function getAddressDomain(address) {
    if (Array.isArray(address)) {
        return getAddressDomain(address[0]);
    }

    if (address && typeof address === 'object') {
        address = address.address;
    }

    if (!address || typeof address !== 'string') return '';
    const atIndex = address.lastIndexOf('@');
    return atIndex > 0 ? address.slice(atIndex + 1).toLowerCase() : '';
}

function logMailerooConfiguration(apiKey, from) {
    const keyIsString = typeof apiKey === 'string';
    const keyIsPresent = keyIsString && apiKey.trim().length > 0;
    const fromDomain = getAddressDomain(from);
    const configuredVerifiedDomain = process.env.MAILEROO_VERIFIED_DOMAIN?.trim().toLowerCase() || '';
    const domainMatchesConfiguredValue = Boolean(
        configuredVerifiedDomain && fromDomain === configuredVerifiedDomain
    );

    console.info('[Maileroo] Environment check:', {
        apiKeyDefined: apiKey !== undefined,
        apiKeyType: typeof apiKey,
        apiKeyPresent: keyIsPresent,
        apiKeyLength: keyIsString ? apiKey.length : 0,
        fromAddress: redactAddress(from),
        fromDomain: fromDomain || '[missing]',
        configuredVerifiedDomain: configuredVerifiedDomain || '[not configured]',
        domainMatchesConfiguredValue
    });

    if (!keyIsPresent) {
        console.error('[Maileroo] MAILEROO_API_KEY is undefined or empty at request time.');
    }

    if (!fromDomain) {
        console.error('[Maileroo] MAILEROO_FROM_EMAIL does not contain a valid email domain.');
    } else if (configuredVerifiedDomain && !domainMatchesConfiguredValue) {
        console.error('[Maileroo] Sender domain does not match MAILEROO_VERIFIED_DOMAIN.', {
            fromDomain,
            configuredVerifiedDomain
        });
    } else {
        console.info(
            '[Maileroo] Sender domain must be verified in Maileroo:',
            fromDomain
        );
    }
}

function getMailerooError(status, body) {
    let message = body;

    try {
        const parsed = JSON.parse(body);
        message = parsed.message || parsed.error || body;
    } catch {
        // Maileroo may return plain text for an error response.
    }

    return new Error(`Maileroo returned ${status}: ${String(message).slice(0, 300)}`);
}

async function sendMail({ apiKey, ...mail }) {
    console.info('[Maileroo] Request payload metadata:', {
        from: redactAddress(mail.from),
        to: redactAddress(mail.to),
        subject: mail.subject || '[missing]'
    });

    logMailerooConfiguration(apiKey, mail.from);

    if (!apiKey) {
        throw new Error('MAILEROO_API_KEY is not configured.');
    }

    const response = await fetch(MAILEROO_ENDPOINT, {
        method: 'POST',
        headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mail)
    });

    const body = await response.text();
    console.info('[Maileroo] Response:', {
        statusCode: response.status,
        statusText: response.statusText,
        body
    });

    if (!response.ok) {
        throw getMailerooError(response.status, body);
    }

    return body;
}

module.exports = { sendMail };
