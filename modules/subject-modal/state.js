import { PRESET_COLORS, PRESET_ICONS } from './constants.js';

export const modalState = {
  selectedColor: PRESET_COLORS[0],
  customColorValue: '#6366f1',
  isCustomSelected: false,
  selectedIcon: PRESET_ICONS[0].id,
  isCustomIconSelected: false,

  pickerHue: 238,
  pickerSat: 0.58,
  pickerVal: 0.94,
  isDraggingCanvas: false,
  isDraggingSlider: false,
  justFinishedDrag: false,

  autosuggestActiveIndex: -1,
  currentAutosuggestList: []
};

export function resetModalState() {
  modalState.selectedColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
  modalState.selectedIcon = PRESET_ICONS[0].id;
  modalState.isCustomSelected = false;
  modalState.isCustomIconSelected = false;
  modalState.autosuggestActiveIndex = -1;
  modalState.currentAutosuggestList = [];
}
