export type GroupEvent = {}

export type CollabView = GroupEvent & {
    id: string,
    groupId: string,
    title: string,
    start_date: string,
    end_date: string,
    exercise_points: string,
    rep_multiplier: number,
    weight_multiplier: number,
    goal: number
};

export type CompeteView = GroupEvent & {
    id: string,
    groupId: string,
    title: string,
    start_date: string,
    end_date: string,
    exercise_points: string,
    rep_multiplier: number,
    weight_multiplier: number,
}