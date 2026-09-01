export const PRIORITIES = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

export const PRIORITY_VALUES = Object.values(PRIORITIES);

export const PRIORITY_WEIGHTS = {
  [PRIORITIES.HIGH]: 3,
  [PRIORITIES.MEDIUM]: 2,
  [PRIORITIES.LOW]: 1,
};
