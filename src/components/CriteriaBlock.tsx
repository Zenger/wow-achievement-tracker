import {Achievement, Criteria} from "../Interfaces";
import React, {useEffect} from "react";
import AchievementBlock, {Completeness, extractSteps} from "./AchievementBlock";
import {useCharacterAchievements} from "../TrackerScreen";
import achievementBlock from "./AchievementBlock";


interface CriteriaBlockProps {
    description: string;
    criteria: Criteria;
    completeness: Completeness;
    forceOpen: boolean;
}


const CriteriaBlock = (props: CriteriaBlockProps) => {


    const isCriteriaCompleted = () => {
        return (props.completeness.completedSteps.filter((c) => c.id === props.criteria.id).length > 0);

    }


    const getIconUrl = (): string => {
        if (props.criteria.achievement) {
            if (props.criteria.achievement.media && props.criteria.achievement.media.assets) {
                return props.criteria.achievement.media.assets[0].value || "";
            }
        }
        return "";
    }
    return <div className={'criteria-block'}>
        {props.criteria.achievement ?
            <AchievementBlock title={props.criteria.achievement.name}
                              iconUrl={getIconUrl()}
                              data={props.criteria} forceOpen={props.forceOpen} /> :
            <span className={`criteria ${isCriteriaCompleted() ? "completed" : ""}`}>{props.description}</span>}
    </div>
}

export default CriteriaBlock;
