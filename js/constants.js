var keyMirror = require('keymirror');

module.exports.actions = keyMirror({
  REGDEM_SET_OBJEKT_ID: null,
  REGDEM_CLOSE_EDITOR: null,
  REGDEM_EXPAND_EDITOR: null,
  REGDEM_FETCH_OBJEKT_POSITIONS: null,
  REGDEM_FETCH_OBJEKT_TYPES: null,
  REGDEM_SET_INPUT_VALUE: null,
  REGDEM_EXECUTE_SEARCH: null,
  REGDEM_ADD_MAPDATA_AS_REFERENCE: null,
  REGDEM_RESET_APP: null,
  REGDEM_CLOSE_LIST: null,
  REGDEM_SHOW_LIST: null
});

module.exports.values = {
  REGDEM_SIZE_DESKTOP: 800
};
