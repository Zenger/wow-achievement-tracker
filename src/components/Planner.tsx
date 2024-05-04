import {useEffect, useState} from "react";
import {useCharacterAchievements} from "../TrackerScreen";

interface PlannerProps {
    achievementTree: any,
}

const Planner = (props: PlannerProps) => {

    const [isLoading, setLoading] = useState<boolean>(false);
    const characterAchievements = useCharacterAchievements();

    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:5000/planner`, { method: "POST" , body: JSON.stringify({'achievementTree': props.achievementTree, 'characterAchievements': characterAchievements})})
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setLoading(false);
            });
    }, []);

    return <article aria-busy={isLoading}>

    </article>
}
export default Planner;
