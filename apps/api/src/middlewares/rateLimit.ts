const ipMap = new Map(); // key: ip, val: [timestamps]

export function rateLimitByIp(req, res, next) {
    const userIpAddress = req.ip;
    const currentDate = Date.now();
    const allowedTimeWindow = 5 * 60000; // 5 minutes
    const maxAllowedRequests = 3;

    const timestamps = ipMap.get(userIpAddress) || [];

    const recentRequestTimeStamp = timestamps.filter((t: number) => currentDate - t < allowedTimeWindow);
    if (recentRequestTimeStamp)
        recentRequestTimeStamp.push(currentDate);

    ipMap.set(userIpAddress, recentRequestTimeStamp);

    if (recentRequestTimeStamp.length > maxAllowedRequests) {
        // Still act as if success, just don’t call supabase
        return res.json({ ok: true, message: 'If that email is registered, a sign-in link has been sent.' });
    }
    next();
}
