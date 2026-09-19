const MAILEROO_ENDPOINT = 'https://smtp.maileroo.com/send';

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
    if (!apiKey) {
        throw new Error('MAILEROO_API_KEY is not configured.');
    }

    const formData = new FormData();
    Object.entries(mail).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            formData.append(key, String(value));
        }
    });

    const response = await fetch(MAILEROO_ENDPOINT, {
        method: 'POST',
        headers: {
            'X-API-Key': apiKey
        },
        body: formData
    });

    const body = await response.text();
    if (!response.ok) {
        throw getMailerooError(response.status, body);
    }

    return body;
}

module.exports = { sendMail };
