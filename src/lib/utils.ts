import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, parseISO } from 'date-fns';

export function generateId(): string {
  return crypto.randomUUID();
}

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'MMM d, yyyy');
}

export function formatDayShort(date: string): string {
  return format(parseISO(date), 'EEE d');
}

export function getWeekStart(date: Date = new Date()): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

export function getWeekDays(weekStart: string): string[] {
  const start = parseISO(weekStart);
  const end = endOfWeek(start, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));
}

export function isDayToday(date: string): boolean {
  return isToday(parseISO(date));
}

export function getWeekLabel(weekStart: string): string {
  const start = parseISO(weekStart);
  const end = endOfWeek(start, { weekStartsOn: 1 });
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
}

const PROJECT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
];

export function randomColor(): string {
  return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
}
