const USERNAME = 'cjw21332';

function getDateRange() {
    const to = new Date();
    const from = new Date(to);
    from.setFullYear(from.getFullYear() - 1);
    return { from: from.toISOString(), to: to.toISOString() };
}

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        return res.status(503).json({ error: 'GitHub contributions are not configured.' });
    }

    const { from, to } = getDateRange();
    const query = `query($login:String!, $from:DateTime!, $to:DateTime!) {
        user(login:$login) {
            contributionsCollection(from:$from, to:$to) {
                contributionCalendar {
                    totalContributions
                    weeks { contributionDays { date contributionCount color } }
                }
            }
        }
    }`;

    try {
        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'CJ-Walet-Portfolio'
            },
            body: JSON.stringify({ query, variables: { login: USERNAME, from, to } })
        });
        const body = await response.json();

        if (!response.ok || body.errors || !body.data?.user) {
            console.error('[GitHub] Contribution API response:', response.status, body);
            return res.status(502).json({ error: 'GitHub contributions could not be loaded.' });
        }

        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        return res.status(200).json({
            username: USERNAME,
            from,
            to,
            ...body.data.user.contributionsCollection.contributionCalendar
        });
    } catch (error) {
        console.error('[GitHub] Contribution request failed:', error);
        return res.status(502).json({ error: 'GitHub contributions could not be loaded.' });
    }
};
