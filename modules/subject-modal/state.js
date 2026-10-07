import { PRESET_COLORS } from './constants.js';

export const modalState = {
  selectedColor: '#4ec9b0',
  customColorValue: '#4ec9b0',
  isCustomSelected: false,
  selectedIcon: '',
  isCustomIconSelected: false,
  autosuggestActiveIndex: -1,
  currentAutosuggestList: [],
  editingSubjectId: null
};

export function resetModalState() {
  modalState.selectedColor = '#4ec9b0';
  modalState.selectedIcon = '';
  modalState.isCustomSelected = false;
  modalState.isCustomIconSelected = false;
  modalState.autosuggestActiveIndex = -1;
  modalState.currentAutosuggestList = [];
  modalState.editingSubjectId = null;
}
