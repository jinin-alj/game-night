export type Game = {
  id: string;
  title: string;
  minPlayers: number;
  maxPlayers: number;
  playtimeMinutes: number;
  copyOwnerId: string | null;
};
