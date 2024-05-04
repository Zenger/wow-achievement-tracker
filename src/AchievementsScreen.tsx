import React from "react";

interface AchievementsScreenProps {
    access_token: string;
    onAchievementSelected: (achievement: { id: number }) => void;
    onAchievementsLoaded: (achievements: any[]) => void;
}

const AchievementsScreen = (props: AchievementsScreenProps) => {
    const [achievements, setAchievements] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    React.useEffect(() => {
        setIsLoading(true);
        const {
            client_id,
            client_secret,
            character_name,
            realm_name
        } = JSON.parse(localStorage.getItem('pain_tracker') || '{}');
        fetch('https://us.api.blizzard.com/profile/wow/character/' + realm_name + '/' + character_name + '/achievements?namespace=profile-us&locale=en_US', {
            headers: {
                'Authorization': 'Bearer ' + props.access_token
            }
        }).then(response => response.json()).then((data: any) => {
            // filter out completed achievements
            const a = data.achievements.filter((achievement: any) => !('completed_timestamp' in achievement));
            setAchievements(a);

            props.onAchievementsLoaded(data.achievements);
        }).catch((error) => {
            alert('Error fetching achievements');
        }).finally(() => {
            setIsLoading(false);
        });
    }, [props.access_token]);

    return (
        <div>
            <h1>Achievements</h1>
            {isLoading && <article aria-busy="true"></article>}
            {!isLoading && <div>
                {achievements.map(achievement => <div>
                        <details key={achievement.achievement.id} onClick={() => props.onAchievementSelected(achievement)}>
                            <summary>{achievement.achievement.name}</summary>
                        </details>
                        <hr/>
                    </div>
                )}
            </div>}
        </div>
    );
}


export default AchievementsScreen;
