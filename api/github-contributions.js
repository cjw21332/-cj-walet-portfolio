const USERNAME = 'cjw21332';
const CONTRIBUTION_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

function getDateRange() {
    const fromDate = '2025-09-01';
    const toDate = '2026-09-19';
    return {
        from: `${fromDate}T00:00:00Z`,
        to: `${toDate}T23:59:59Z`,
        fromDate,
        toDate
    };
}

function buildCalendar(contributions, fromDate, toDate) {
    const byDate = new Map(contributions.map(day => [day.date, day]));
    const days = [];
    const cursor = new Date(`${fromDate}T00:00:00Z`);
    const end = new Date(`${toDate}T00:00:00Z`);

    while (cursor <= end) {
        const date = cursor.toISOString().slice(0, 10);
        const source = byDate.get(date);
        const count = Number(source?.count || 0);
        days.push({
            date,
            contributionCount: count,
            color: source?.color || CONTRIBUTION_COLORS[Math.min(Number(source?.level || 0), 4)]
        });
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    const weeks = [];
    for (let index = 0; index < days.length; index += 7) {
        weeks.push({ contributionDays: days.slice(index, index + 7) });
    }
    return {
        totalContributions: days.reduce((total, day) => total + day.contributionCount, 0),
        weeks
    };
}

async function getPublicContributionData(fromDate, toDate) {
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`, {
        headers: { 'User-Agent': 'CJ-Walet-Portfolio' }
    });
    if (!response.ok) throw new Error(`Public contribution API HTTP ${response.status}`);
    const body = await response.json();
    const contributions = Array.isArray(body.contributions)
        ? body.contributions.filter(day => day.date >= fromDate && day.date <= toDate)
        : [];
    if (!contributions.length) throw new Error('Public contribution API returned no calendar data.');
    return buildCalendar(contributions, fromDate, toDate);
}

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const token = process.env.GITHUB_TOKEN;
    const { from, to, fromDate, toDate } = getDateRange();
    if (!token) {
        try {
            const calendar = await getPublicContributionData(fromDate, toDate);
            res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
            return res.status(200).json({ username: USERNAME, from, to, fromDate, toDate, ...calendar });
        } catch (error) {
            console.error('[GitHub] Public contribution fallback failed:', error);
            return res.status(502).json({ error: 'GitHub contributions could not be loaded.' });
        }
    }
    console.info('[GitHub] Loading contribution data for cjw21332.');
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

        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
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
