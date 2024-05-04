interface AchievementResponseBlob {
    id: number;
    name: string;
    description: string;
    media: {
        key: {
            href: string;
        }
    };
    criteria?: {
        id: number;
        amount: number;
        description: string;
        child_criteria?: {
            id: number;
            description: string;
            achievement?: {
                id: number;
                name: string;
            }
        }[];
    }
}
// `https://us.api.blizzard.com/data/wow/achievement/${id}?namespace=static-us&locale=en_US&access_token=USBLmlxQTIyuNv8g30RITAw9K1OGpk92hw`



class Achievement {
    achievement: AchievementResponseBlob;
    allAchievements: AchievementResponseBlob[] = [];
    hierarchyAchievements: AchievementResponseBlob[];

    constructor(achievement: AchievementResponseBlob) {
        this.achievement = achievement;
        this.hierarchyAchievements = [achievement]; // Initialize with root achievement
    }

    async loadAllRequirements(): Promise<void> {
        await this.extractAllRequirements(this.achievement, this.hierarchyAchievements);
    }

    private async extractAllRequirements(achievement: AchievementResponseBlob, parentHierarchy: AchievementResponseBlob[]): Promise<void> {
        this.allAchievements.push(achievement);

        if (achievement.criteria && achievement.criteria.child_criteria) {
            const childPromises = achievement.criteria.child_criteria.map(async (child) => {
                if (child.achievement) {
                    const childAchievement = await this.fetchAchievement(child.achievement.id);
                    if (childAchievement) {
                        parentHierarchy.push(childAchievement); // Add to hierarchy
                        await this.extractAllRequirements(childAchievement, parentHierarchy);
                        parentHierarchy.pop(); // Remove after processing to maintain correct path
                    }
                }
            });

            // Wait for all child criteria to be processed
            await Promise.all(childPromises);
        }
    }

    private async fetchAchievement(id: number): Promise<AchievementResponseBlob | null> {
        try {
            const response = await fetch(`https://us.api.blizzard.com/data/wow/achievement/${id}?namespace=static-us&locale=en_US&access_token=USBLmlxQTIyuNv8g30RITAw9K1OGpk92hw`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json() as AchievementResponseBlob;
        } catch (error) {
            console.error('Failed to fetch achievement:', error);
            return null;
        }
    }
}

export default Achievement;
