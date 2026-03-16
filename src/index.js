/**
 * Alert block for the Editor.js.
 *
 * @author Vishal Telangre
 * @license MIT
 */

/**
 * Build styles
 */
require('./index.scss').toString();

/**
 * Import Tool's icons
 */
import ToolboxIcon from '../assets/icon.svg';
import SettingsIcon from '../assets/settings-icon.svg';
import AlignLeftIcon from '../assets/align-left-icon.svg';
import AlignCenterIcon from '../assets/align-center-icon.svg';
import AlignRightIcon from '../assets/align-right-icon.svg';

/**
 * @class Alert
 * @classdesc Alert Tool for Editor.js
 * @property {AlertData} data - Alert Tool`s input and output data
 * @property {object} api - Editor.js API instance
 *
 * @typedef {object} AlertData
 * @description Alert Tool`s input and output data
 * @property {string} type - Alert type
 * @property {string} alignType - Alert align type
 * @property {string} message - Alert message
 *
 * @typedef {object} AlertConfig
 * @description Alert Tool`s initial configuration
 * @property {string} defaultType - default Alert type
 * @property {string} defaultAlignType - default align Alert type
 * @property {string} messagePlaceholder - placeholder to show in Alert`s message input
 */
export default class Alert {
  /**
   * Get Toolbox settings
   *
   * @public
   * @returns {string}
   */
  static get toolbox() {
    return {
      icon: ToolboxIcon,
      title: 'Alert',
    };
  }

  /**
   * Allow to press Enter inside the Alert block
   * @public
   * @returns {boolean}
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * Default Alert type
   *
   * @public
   * @returns {string}
   */
  static get DEFAULT_TYPE() {
    return 'info';
  }

  /**
   * Default Alert align type
   *
   * @public
   * @returns {string}
   */
  static get DEFAULT_ALIGN_TYPE() {
    return 'left';
  }

  /**
   * Default placeholder for Alert message
   *
   * @public
   * @returns {string}
   */
  static get DEFAULT_MESSAGE_PLACEHOLDER() {
    return 'Type here...';
  }

  /**
   * Supported Alert types
   *
   * @public
   * @returns {array}
   */
  static get ALERT_TYPES() {
    return [
      'primary',
      'secondary',
      'info',
      'success',
      'warning',
      'danger',
      'light',
      'dark',
    ];
  }

  /**
   * Supported Align types
   *
   * @public
   * @returns {array}
   */
  static get ALIGN_TYPES() {
    return ['left', 'center', 'right'];
  }

  /**
   * Alert Tool`s styles
   *
   * @returns {Object}
   */
  get CSS() {
    return {
      wrapper: 'cdx-alert',
      wrapperForType: (type) => `cdx-alert-${type}`,
      wrapperForAlignType: (alignType) => `cdx-alert-align-${alignType}`,
      message: 'cdx-alert__message',
      meta: 'cdx-alert__meta',
    };
  }

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {AlertData} data — previously saved data
   * @param {AlertConfig} config — user config for Tool
   * @param {Object} api - Editor.js API
   * @param {boolean} readOnly - read only mode flag
   */
  constructor({ data, config, api, readOnly }) {
    this.api = api;

    this.alertTypes = config.alertTypes || Alert.ALERT_TYPES;
    this.defaultType = config.defaultType || Alert.DEFAULT_TYPE;
    this.defaultAlign = config.defaultAlign || Alert.DEFAULT_ALIGN_TYPE;
    this.messagePlaceholder =
      config.messagePlaceholder || Alert.DEFAULT_MESSAGE_PLACEHOLDER;

    this.showMeta = config.showMeta !== false;
    this.getCurrentUserFullName =
      typeof config.getCurrentUserFullName === 'function'
        ? config.getCurrentUserFullName
        : null;
    this.dateLocale = typeof config.dateLocale === 'string' ? config.dateLocale : '';

    this.data = {
      type: this.alertTypes.includes(data.type)
        ? data.type
        : this.defaultType,
      align: Alert.ALIGN_TYPES.includes(data.align)
        ? data.align
        : this.defaultAlign,
      message: data.message || '',
      authorFullName:
        typeof data.authorFullName === 'string' ? data.authorFullName : '',
      createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
    };

    this.container = undefined;
    this.metaEl = undefined;

    this.readOnly = readOnly;

    this._ensureMetaOnNewBlock(data);
  }

  /**
   * Only auto-fill meta for a brand-new empty block.
   * Existing blocks without meta are kept unchanged to avoid wrong attribution.
   *
   * @private
   */
  _ensureMetaOnNewBlock(initialData) {
    if (!this.showMeta) return;

    const hasMeta =
      (typeof this.data.authorFullName === 'string' &&
        this.data.authorFullName.trim().length > 0) ||
      (typeof this.data.createdAt === 'string' &&
        this.data.createdAt.trim().length > 0);

    if (hasMeta) return;

    const initialMessage =
      initialData && typeof initialData.message === 'string'
        ? initialData.message
        : '';
    const isEmptyNewBlock = !initialMessage || initialMessage.trim().length === 0;
    if (!isEmptyNewBlock) return;

    const author = this._resolveCurrentUserFullName();
    if (author) this.data.authorFullName = author;
    this.data.createdAt = new Date().toISOString();
  }

  /**
   * @returns {string}
   * @private
   */
  _resolveCurrentUserFullName() {
    try {
      if (this.getCurrentUserFullName) {
        const v = this.getCurrentUserFullName();
        if (typeof v === 'string') return v.trim();
      }
    } catch (_) {
      // ignore
    }
    return '';
  }

  /**
   * @returns {string}
   * @private
   */
  _formatDate(iso) {
    if (typeof iso !== 'string' || !iso.trim()) return '';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '';
      return d.toLocaleDateString(this.dateLocale || undefined);
    } catch (_) {
      return '';
    }
  }

  /**
   * @returns {string}
   * @private
   */
  _formatMetaText() {
    if (!this.showMeta) return '';
    const author =
      typeof this.data.authorFullName === 'string'
        ? this.data.authorFullName.trim()
        : '';
    const dateStr = this._formatDate(this.data.createdAt);
    if (!author && !dateStr) return '';
    if (author && dateStr) return `${author} · ${dateStr}`;
    return author || dateStr;
  }

  /**
   * Returns true to notify the core that read-only mode is supported
   *
   * @return {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Create Alert Tool container
   *
   * @returns {Element}
   */
  render() {
    const containerClasses = [
      this.CSS.wrapper,
      this.CSS.wrapperForType(this.data.type),
      this.CSS.wrapperForAlignType(this.data.align),
    ];

    this.container = this._make('div', containerClasses);

    const messageEl = this._make('div', [this.CSS.message], {
      contentEditable: !this.readOnly,
      innerHTML: this.data.message,
    });

    messageEl.dataset.placeholder = this.messagePlaceholder;

    if (!this.readOnly) {
      this._lockMessageNavigationInside(messageEl);
    }

    this.container.appendChild(messageEl);

    if (this.showMeta) {
      const metaText = this._formatMetaText();
      this.metaEl = this._make('div', [this.CSS.meta], {
        contentEditable: false,
        innerText: metaText,
      });
      if (!metaText) this.metaEl.style.display = 'none';
      this.container.appendChild(this.metaEl);
    }

    return this.container;
  }

  /**
   * Prevent navigation keys and boundary Backspace from bubbling up to Editor.js,
   * which can interpret them as block-level actions.
   *
   * @param {HTMLElement} messageEl
   * @private
   */
  _lockMessageNavigationInside(messageEl) {
    const lockedKeys = new Set([
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'PageUp',
      'PageDown',
    ]);

    messageEl.addEventListener(
      'keydown',
      (event) => {
        if (lockedKeys.has(event.key)) {
          event.stopPropagation();
          event.stopImmediatePropagation();
          return;
        }

        if (event.key === 'Backspace' && this._isCaretAtStart(messageEl)) {
          event.stopPropagation();
          event.stopImmediatePropagation();
        }
      },
      true
    );
  }

  /**
   * @param {HTMLElement} root
   * @returns {boolean}
   * @private
   */
  _isCaretAtStart(root) {
    const selection = window.getSelection && window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    if (!range.collapsed) return false;
    if (!root.contains(range.startContainer)) return false;

    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(root);

    try {
      preCaretRange.setEnd(range.startContainer, range.startOffset);
    } catch (_) {
      return false;
    }

    return preCaretRange.toString() === '';
  }

  /**
   * Create Block's settings block
   *
   * @returns {array}
   */
  renderSettings() {
    const alertTypes = this.alertTypes.map((type) => ({
      icon: SettingsIcon,
      name: `alert-${type}`,
      label: this._getFormattedName(type),
      toggle: 'alert',
      isActive: this.data.type === type,
      onActivate: () => {
        this._changeAlertType(type);
      },
    }));

    const alignTypes = Alert.ALIGN_TYPES.map((align) => ({
      icon:
        align == 'left'
          ? AlignLeftIcon
          : align == 'center'
          ? AlignCenterIcon
          : align == 'right'
          ? AlignRightIcon
          : IconAlign_left,
      name: `align-${align}`,
      label: this._getFormattedName(align),
      toggle: 'align',
      isActive: this.data.align === align,
      onActivate: () => {
        this._changeAlignType(align);
      },
    }));
    return [...alertTypes, ...alignTypes];
  }

  /**
   * Helper for formatting Alert Type / Align Type
   *
   * @param {string} type - Alert type or Align type
   * @returns {string}
   */
  _getFormattedName(name) {
    return this.api.i18n.t(name.charAt(0).toUpperCase() + name.slice(1));
  }

  /**
   * Helper for changing style of Alert block with the selected Alert type
   *
   * @param {string} newType - new Alert type to be applied to the block
   * @private
   */
  _changeAlertType(newType) {
    // Save new type
    this.data.type = newType;

    this.alertTypes.forEach((type) => {
      const alertClass = this.CSS.wrapperForType(type);

      // Remove the old Alert type class
      this.container.classList.remove(alertClass);

      if (newType === type) {
        // Add an Alert class for the selected Alert type
        this.container.classList.add(alertClass);
      }
    });
  }

  /**
   * Helper for changing align of Alert block with the selected Align type
   *
   * @param {string} newAlign - new align type to be applied to the block
   * @private
   */
  _changeAlignType(newAlign) {
    // Save new type
    this.data.align = newAlign;

    Alert.ALIGN_TYPES.forEach((align) => {
      const alignClass = this.CSS.wrapperForAlignType(align);

      // Remove the old Alert type class
      this.container.classList.remove(alignClass);

      if (newAlign === align) {
        // Add an Alert class for the selected Alert type
        this.container.classList.add(alignClass);
      }
    });
  }

  /**
   * Extract Alert data from Alert Tool element
   *
   * @param {HTMLDivElement} alertElement - element to save
   * @returns {AlertData}
   */
  save(alertElement) {
    const messageEl = alertElement.querySelector(`.${this.CSS.message}`);

    return { ...this.data, message: messageEl.innerHTML };
  }

  /**
   * Helper for making Elements with attributes
   *
   * @param  {string} tagName           - new Element tag name
   * @param  {array|string} classNames  - list or name of CSS classname(s)
   * @param  {Object} attributes        - any attributes
   * @returns {Element}
   * @private
   */
  _make(tagName, classNames = null, attributes = {}) {
    let el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }

    for (let attrName in attributes) {
      el[attrName] = attributes[attrName];
    }

    return el;
  }

  /**
   * Fill Alert's message with the pasted content
   *
   * @param {PasteEvent} event - event with pasted content
   */
  onPaste(event) {
    const { data } = event.detail;

    this.data.type = this.defaultType;
    this.data.align = this.defaultAlign;
    this.data.message = data.innerHTML || '';

    if (this.showMeta) {
      if (!this.data.createdAt) this.data.createdAt = new Date().toISOString();
      if (!this.data.authorFullName) {
        const author = this._resolveCurrentUserFullName();
        if (author) this.data.authorFullName = author;
      }
    }

    if (this.metaEl) {
      const metaText = this._formatMetaText();
      this.metaEl.innerText = metaText;
      this.metaEl.style.display = metaText ? '' : 'none';
    }
  }

  /**
   * Allow Alert to be converted to/from other blocks
   */
  static get conversionConfig() {
    return {
      // export Alert's message for other blocks
      export: (data) => data.message,
      // fill Alert's message from other block's export string
      import: (string) => {
        return {
          message: string,
          type: this.DEFAULT_TYPE,
          alignType: this.DEFAULT_ALIGN_TYPE,
        };
      },
    };
  }

  /**
   * Sanitizer config for Alert Tool saved data
   * @returns {Object}
   */
  static get sanitize() {
    return {
      message: true,
      type: false,
      alignType: false,
      align: false,
      authorFullName: false,
      createdAt: false,
    };
  }
}
