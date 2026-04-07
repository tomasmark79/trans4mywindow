import Meta from 'gi://Meta';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class TransparentWindowsExtension extends Extension {
  enable() {
    this._settings = this.getSettings();
    this._onFocusChanged = this._onFocusChanged.bind(this);
    this._onSettingsChanged = this._onSettingsChanged.bind(this);

    this._focusChangedId = global.display.connect(
      'notify::focus-window',
      this._onFocusChanged
    );
    this._settingsChangedId = this._settings.connect(
      'changed',
      this._onSettingsChanged
    );

    this._onFocusChanged();
  }

  disable() {
    if (this._focusChangedId) {
      global.display.disconnect(this._focusChangedId);
      this._focusChangedId = null;
    }

    if (this._settingsChangedId) {
      this._settings.disconnect(this._settingsChangedId);
      this._settingsChangedId = null;
    }

    this._getAllWindows().forEach(window => {
      this._setWindowOpacity(window, 255);
    });

    this._settings = null;
  }

  _getOpacityFromSetting(key) {
    const opacityPercentage = this._settings.get_int(key);
    const clampedOpacity = Math.max(5, Math.min(100, opacityPercentage));

    return Math.round((clampedOpacity / 100) * 255);
  }

  _getWindowFilterList() {
    return this._settings
      .get_string('window-filter')
      .split(',')
      .map(filter => filter.trim().toLowerCase())
      .filter(filter => filter.length > 0);
  }

  _getAllWindows() {
    const windows = [];
    const workspaceManager = global.workspace_manager;

    if (!workspaceManager) {
      console.log('Workspace manager not available');
      return windows;
    }

    const numWorkspaces = workspaceManager.get_n_workspaces();

    for (let i = 0; i < numWorkspaces; i++) {
      const workspace = workspaceManager.get_workspace_by_index(i);
      if (workspace) {
        const workspaceWindows = global.display.get_tab_list(
          Meta.TabList.NORMAL_ALL,
          workspace
        );
        if (workspaceWindows) {
          windows.push(...workspaceWindows);
        }
      }
    }

    return windows;
  }

  _onSettingsChanged() {
    // Reapply transparency when settings change
    this._onFocusChanged();
  }

  _onFocusChanged() {
    if (!this._settings) {
      return;
    }

    const focusedWindow = global.display.get_focus_window();
    const windows = this._getAllWindows();
    const activeOpacity = this._getOpacityFromSetting('active-window-opacity');
    const inactiveOpacity = this._getOpacityFromSetting(
      'inactive-window-opacity'
    );
    const filterList = this._getWindowFilterList();

    for (const window of windows) {
      if (!window) continue;

      // If a filter is set, only apply transparency to matching windows
      if (filterList.length > 0) {
        const wmClass = (window.get_wm_class() || '').toLowerCase();
        if (!filterList.some(filter => wmClass.includes(filter))) {
          this._setWindowOpacity(window, 255);
          continue;
        }
      }

      if (window === focusedWindow) {
        this._setWindowOpacity(window, activeOpacity);
      } else {
        this._setWindowOpacity(window, inactiveOpacity);
      }
    }
  }

  _setWindowOpacity(window, targetOpacity) {
    if (!window) return;
    const actor = window.get_compositor_private();
    if (!actor) return;
    actor.remove_all_transitions();
    actor.opacity = targetOpacity;
  }
}
