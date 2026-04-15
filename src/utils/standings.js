import { sortByRanking } from './matchmaking';

/**
 * Returns teams sorted by ranking from a tournoi object.
 */
export function getRankedTeams(tournoi) {
  return sortByRanking(tournoi.equipes);
}
