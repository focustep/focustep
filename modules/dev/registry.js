/**
 * Generic Record Registry for Dev Toolkit
 * Enables dynamic table generation and inline field editing without hardcoded UI.
 */

export const RECORD_REGISTRY = {
  sessions: {
    key: 'focustep_sessions',
    name: 'Sessions',
    idField: 'id',
    dateFields: ['timestamp'],
    durationField: 'durationSec',
    durationUnit: 'sec', // converted to minutes for UI editing
    labelField: 'subjectId',
    fields: [
      {
        key: 'subjectId',
        label: 'Subject',
        type: 'subject-select',
        required: true,
      },
      {
        key: 'timestamp',
        label: 'Date & Time',
        type: 'datetime-local',
        required: true,
      },
      {
        key: 'durationSec',
        label: 'Minutes',
        type: 'duration-minutes',
        required: true,
        min: 1,
      },
    ],
    createDefault: (subjects = []) => {
      const sub = subjects[0] || { id: 'other', name: 'Other' };
      return {
        id: 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        timestamp: Date.now(),
        durationSec: 30 * 60, // 30 minutes
        subjectId: sub.id,
        subjectName: sub.name || '',
        seeded: true
      };
    }
  }
};
