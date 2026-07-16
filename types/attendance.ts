export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceDay {
  day: number;
  status?: AttendanceStatus;
}

export type AttendanceMap = Record<number, AttendanceStatus>;
