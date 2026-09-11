// Re-export modular subject-modal components
export { openSubjectModal, closeSubjectModal, initSubjectModal } from './subject-modal/modal-core.js';
export { updateLivePreview } from './subject-modal/preview.js';
export { renderPalette, openColorPickerPopover, closeColorPickerPopover, setCustomColor } from './subject-modal/color-picker.js';
export { renderIconSelector, openIconPickerPopover, closeIconPickerPopover, renderIconPickerContent } from './subject-modal/icon-picker.js';
export { handleAutosuggestSearch, closeAutosuggest, selectAutosuggestItem } from './subject-modal/autosuggest.js';
export { PRESET_COLORS, PRESET_ICONS } from './subject-modal/constants.js';
export { hsvToHex, hexToHsv } from './subject-modal/color-utils.js';
export { modalState, resetModalState } from './subject-modal/state.js';
