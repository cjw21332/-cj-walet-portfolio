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
        console.warn('[GitHub] GITHUB_TOKEN is missing at request time.');
        return res.status(503).json({ error: 'GitHub contributions are not configured.' });
    }
    console.info('[GitHub] Loading contribution data for cjw21332.');

    const { from, to } = getDateRange();
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
        return res.status(200).json({
            username: USERNAME,
            from,
            to,
            repositoryCount: repositories.totalCount,
            languages,
            ...body.data.user.contributionsCollection.contributionCalendar
        });
    } catch (error) {
        console.error('[GitHub] Contribution request failed:', error);
        return res.status(502).json({ error: 'GitHub contributions could not be loaded.' });
    }
};
