export type Mission = {
  id: string; // unique e.g. "1.1"
  title: string;
  story: string;       // pre-mission scene
  objective: string;   // what the player must do
  hint?: string;
  setupSql: string;    // creates and seeds tables
  expectedSql: string; // canonical solution used to compute expected result
  orderSensitive?: boolean;
  xp: number;
  concepts: string[];  // ["SELECT", "WHERE"]
};

export type Episode = {
  id: string;          // "1.1" - matches first mission's arc.ep
  arcId: number;
  number: number;
  title: string;
  brief: string;
  missions: Mission[];
};

export type Arc = {
  id: number;
  codename: string;
  title: string;
  tagline: string;
  episodes: Episode[];
};
