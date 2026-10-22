export type NightSummary = {
  id: string;
  name: string;
  nightDate: string;
  availableMinutes: number;
};

export type NightDetails = NightSummary & {
  groupId: string;
};

export type Guest = {
  id: string;
  name: string;
};
