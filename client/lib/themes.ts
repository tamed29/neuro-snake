import { ThemeType } from '@/types/game.types';

export interface ThemeColors {
    background: string;
    grid: string;
    snakeHead: [string, string]; // [start, end]
    snakeBody: [string, string]; // [start, end]
    food: string;
    specialFood: string;
    obstacle: string;
    text: string;
}

export const THEMES: Record<ThemeType, ThemeColors> = {
    Cyber: {
        background: '#0B0F14',
        grid: '#1F2937',
        snakeHead: ['#22C55E', '#16A34A'],
        snakeBody: ['#16A34A', '#15803D'],
        food: '#EF4444',
        specialFood: '#A855F7',
        obstacle: '#6B7280',
        text: '#22C55E',
    },
    Forest: {
        background: '#064E3B',
        grid: '#065F46',
        snakeHead: ['#FCD34D', '#D97706'],
        snakeBody: ['#D97706', '#92400E'],
        food: '#F87171',
        specialFood: '#F472B6',
        obstacle: '#064E3B',
        text: '#FCD34D',
    },
    Ocean: {
        background: '#0C4A6E',
        grid: '#0EA5E9',
        snakeHead: ['#38BDF8', '#0284C7'],
        snakeBody: ['#0284C7', '#0369A1'],
        food: '#FDE047',
        specialFood: '#818CF8',
        obstacle: '#1E40AF',
        text: '#38BDF8',
    },
    Sunset: {
        background: '#4C1D95',
        grid: '#7C3AED',
        snakeHead: ['#F472B6', '#DB2777'],
        snakeBody: ['#DB2777', '#9D174D'],
        food: '#FB923C',
        specialFood: '#FCD34D',
        obstacle: '#5B21B6',
        text: '#F472B6',
    },
    Classic: {
        background: 'transparent',
        grid: '#333333',
        snakeHead: ['#FFFFFF', '#CCCCCC'],
        snakeBody: ['#CCCCCC', '#999999'],
        food: '#FFFFFF',
        specialFood: '#FFFF00',
        obstacle: '#444444',
        text: '#FFFFFF',
    },
    Professional: {
        background: '#05070A',
        grid: 'rgba(255, 255, 255, 0.03)',
        snakeHead: ['#00FF66', '#00CC52'],
        snakeBody: ['#00FF66', 'rgba(0, 255, 102, 0.2)'],
        food: '#FFFFFF',
        specialFood: '#00FF66',
        obstacle: '#0D1117',
        text: '#00FF66',
    },
};
