const USERNAME = 'cjw21332';

function getDateRange() {
    const dateFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const parts = Object.fromEntries(dateFormatter.formatToParts(new Date())
        .filter(({ type }) => type !== 'literal')
        .map(({ type, value }) => [type, value]));
    const endDate = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) - 1));
    const startDate = new Date(endDate);
    startDate.setUTCFullYear(startDate.getUTCFullYear() - 1);
    const toDate = endDate.toISOString().slice(0, 10);
    const fromDate = startDate.toISOString().slice(0, 10);
    return {
        from: `${fromDate}T00:00:00Z`,
        to: `${toDate}T23:59:59Z`,
        fromDate,
        toDate
    };
}

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.warn('[GitHub] GITHUB_TOKEN is missing at request time.');
        return res.status(503).json({ error: 'GitHub contributions are not configured.' });
    }
    console.info('[GitHub] Loading contribution data for cjw21332.');

    const { from, to, fromDate, toDate } = getDateRange();
    const query = `query($login:String!, $from:DateTime!, $to:DateTime!) {
        user(login:$login) {
            repositories(first:100, ownerAffiliations:OWNER, isFork:false) {
                totalCount
                nodes {
                    languages(first:8, orderBy:{field:SIZE, direction:DESC}) {
                        edges { size node { name } }
                    }
                }
            }
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
            const errorText = JSON.stringify(body.errors || body).toLowerCase();
            if (response.status === 401 || response.status === 403 || errorText.includes('rate limit')) {
                console.warn('[GitHub] Authentication or rate-limit response received.');
            }
            return res.status(response.status === 403 ? 429 : 502).json({ error: 'GitHub contributions could not be loaded.' });
        }

        const repositories = body.data.user.repositories;
        const languageTotals = {};
        repositories.nodes.forEach(repository => {
            repository.languages.edges.forEach(({ size, node }) => {
                languageTotals[node.name] = (languageTotals[node.name] || 0) + size;
            });
        });
        const languages = Object.entries(languageTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name]) => name);

        res.setHeader('Cache-Control', 's-maxage=1200, stale-while-revalidate=1200');
        const calendar = body.data.user.contributionsCollection.contributionCalendar;
        const visibleWeeks = calendar.weeks.map(week => ({
            ...week,
            contributionDays: week.contributionDays.filter(day => day.date <= toDate)
        })).filter(week => week.contributionDays.length > 0);

        return res.status(200).json({
            username: USERNAME,
            from,
            to,
            fromDate,
            toDate,
            repositoryCount: repositories.totalCount,
            languages,
            totalContributions: calendar.totalContributions,
            weeks: visibleWeeks
        });
    } catch (error) {
        console.error('[GitHub] Contribution request failed:', error);
        return res.status(502).json({ error: 'GitHub contributions could not be loaded.' });
    }
};
