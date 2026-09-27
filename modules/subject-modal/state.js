import { PRESET_COLORS } from './constants.js';
import { getSessionPresetIcons } from './icon-picker.js';
import { getSessionPresetColors } from './color-picker.js';

export const modalState = {
  selectedColor: PRESET_COLORS[0],
  customColorValue: '#6366f1',
  isCustomSelected: false,
  selectedIcon: '',
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

// Default initial color from persistent queue; icons start unselected
const initialColors = getSessionPresetColors();
if (initialColors && initialColors.length > 0) {
  modalState.selectedColor = initialColors[0];
}

modalState.selectedIcon = '';

export function resetModalState() {
  const sessionColors = getSessionPresetColors();
  modalState.selectedColor = (sessionColors && sessionColors.length > 0) ? sessionColors[0] : PRESET_COLORS[0];
  modalState.selectedIcon = '';
  modalState.isCustomSelected = false;
  modalState.isCustomIconSelected = false;
  modalState.autosuggestActiveIndex = -1;
  modalState.currentAutosuggestList = [];
}
