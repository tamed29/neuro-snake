import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  where,
  getDocs,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { LeaderboardEntry, Difficulty } from '@/types/game.types';

export const saveScore = async (
  uid: string,
  username: string,
  score: number,
  difficulty: Difficulty
): Promise<void> => {
  // Skip saving if it's a guest user (fake UID) to avoid Firestore permission errors
  if (uid.startsWith('guest-')) {
    console.log('Skipping score save for guest user');
    return;
  }

  try {
    await addDoc(collection(db, 'scores'), {
      uid,
      username,
      score,
      difficulty,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving score:', error);
    throw error;
  }
};

export const getTopScores = async (
  difficulty?: Difficulty,
  limitCount: number = 10
): Promise<LeaderboardEntry[]> => {
  try {
    const scoresRef = collection(db, 'scores');
    let q = query(scoresRef, orderBy('score', 'desc'), limit(limitCount));

    if (difficulty) {
      q = query(scoresRef, where('difficulty', '==', difficulty), orderBy('score', 'desc'), limit(limitCount));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LeaderboardEntry));
  } catch (error) {
    console.error('Error fetching scores:', error);
    return [];
  }
};

export const getUserBestScore = async (uid: string): Promise<number> => {
  try {
    const scoresRef = collection(db, 'scores');
    const q = query(scoresRef, where('uid', '==', uid), orderBy('score', 'desc'), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return 0;
    return snapshot.docs[0].data().score;
  } catch (error) {
    console.error('Error fetching user best score:', error);
    return 0;
  }
};

export const subscribeToLeaderboard = (
  callback: (scores: LeaderboardEntry[]) => void,
  difficulty?: Difficulty,
  limitCount: number = 10
) => {
  const scoresRef = collection(db, 'scores');
  let q = query(scoresRef, orderBy('score', 'desc'), limit(limitCount));

  if (difficulty) {
    q = query(scoresRef, where('difficulty', '==', difficulty), orderBy('score', 'desc'), limit(limitCount));
  }

  return onSnapshot(q, (snapshot) => {
    const scores = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LeaderboardEntry));
    callback(scores);
  });
};

export const getUserStats = async (uid: string) => {
  try {
    const scoresRef = collection(db, 'scores');
    const q = query(scoresRef, where('uid', '==', uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        highestScore: 0,
        totalGames: 0,
        averageScore: 0,
        bestDifficulty: 'Easy' as Difficulty,
      };
    }

    const scores = snapshot.docs.map(doc => doc.data());
    const highestScore = Math.max(...scores.map(s => s.score));
    const totalGames = scores.length;
    const averageScore = Math.round(scores.reduce((acc, s) => acc + s.score, 0) / totalGames);

    const difficultyScores = scores.reduce((acc, s) => {
      if (!acc[s.difficulty] || s.score > acc[s.difficulty]) {
        acc[s.difficulty] = s.score;
      }
      return acc;
    }, {} as Record<string, number>);

    const bestDifficulty = Object.keys(difficultyScores).reduce((a, b) =>
      difficultyScores[a] > difficultyScores[b] ? a : b
    ) as Difficulty;

    return {
      highestScore,
      totalGames,
      averageScore,
      bestDifficulty,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      highestScore: 0,
      totalGames: 0,
      averageScore: 0,
      bestDifficulty: 'Easy' as Difficulty,
    };
  }
};
