export interface Finder {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  duration: number | null;
}

export type NewFinder = Pick<Finder, 'name'>;
