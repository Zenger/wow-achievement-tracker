import React from "react";

interface AchievementsScreenProps {
    accessToken: string;
    onAchievementSelected: (achievement: { id: number }) => void;
    onAchievementsLoaded: (achievements: any[]) => void;
}

class UnauthorizedError extends Error {}

const AchievementsScreen = (props: AchievementsScreenProps) => {
    const [achievements, setAchievements] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [filteredAchievements, setFilteredAchievements] = React.useState<any[]>([]);
    const [searchTerm, setSearchTerm] = React.useState<string>('');

    React.useEffect(() => {
        setIsLoading(true);
        const {
            clientId,
            clientSecret,
            characterName,
            realmName
        } = JSON.parse(localStorage.getItem('wowTrackerUserData') || '{}');
        fetch('https://us.api.blizzard.com/profile/wow/character/' + realmName + '/' + characterName + '/achievements?namespace=profile-us&locale=en_US', {
            headers: {
                'Authorization': 'Bearer ' + props.accessToken
            }
        }).then(response => {
            if (response.status === 401) throw new UnauthorizedError('Invalid access token');
            if (response.status !== 200) throw new Error('Something went wrong, check logs');
            return response.json();
        }).then((data: any) => {
            // filter out completed achievements
            const a = data.achievements.filter((achievement: any) => !('completed_timestamp' in achievement));
            setAchievements(a);
            setFilteredAchievements(a);

            props.onAchievementsLoaded(data.achievements);
        }).catch((error) => {
            if (error instanceof UnauthorizedError) {
                alert('Unauthorized, please login again');
            }
        }).finally(() => {
            setIsLoading(false);
        });
    }, [props.accessToken]);

    const filterResults = (searchTerm: string)  => {
        setSearchTerm(searchTerm);

        if (searchTerm.length === 0) {
            return setFilteredAchievements(achievements);
        } else {
            const filtered = achievements.filter(achievement => achievement.achievement.name.toLowerCase().includes(searchTerm));
            setFilteredAchievements(filtered);
        }
    }

    const highlightMatch = (item: string, searchTerm: string) => {
        const index = item.toLowerCase().indexOf(searchTerm.toLowerCase());
        if (index === -1) return item;

        const beforeMatch = item.substring(0, index);
        const match = item.substring(index, index + searchTerm.length);
        const afterMatch = item.substring(index + searchTerm.length);

        return (
            <>
                {beforeMatch}
                <span style={{ textDecoration : "underline", fontWeight: "bold", fontSize: "15px" }}>{match}</span>
                {afterMatch}
            </>
        );
    };

    return (
        <div>
            <h2>Achievements</h2>
            <p>This is a list of your current, uncompleted achievements. </p>
            <hr />
            {isLoading && <article aria-busy="true"></article>}
            {!isLoading && <div>
                <input type='text' placeholder='Type to search' onChange={(e) => filterResults(e.target.value)} />
                <hr />
                {filteredAchievements.map(achievement => <div key={achievement.achievement.id}>
                        <details  onClick={() => props.onAchievementSelected(achievement)}>
                            <summary>{highlightMatch(achievement.achievement.name, searchTerm)}</summary>
                        </details>
                        <hr/>
                    </div>
                )}
            </div>}
        </div>
    );
}


export default AchievementsScreen;
