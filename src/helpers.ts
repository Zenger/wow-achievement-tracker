export const wu = (id: number | undefined) => {
    return `https://www.wowhead.com/achievement=${id}`;
}

export const deleteUserSession = () => {
    localStorage.removeItem('wowTrackerAchievementId');
    localStorage.removeItem('wowTrackerUserData');
    localStorage.removeItem('wowTrackerAccessToken');
    window.location.reload();
}

export class UnauthorizedError extends Error {}