/* eslint-disable no-underscore-dangle, max-classes-per-file */

const ACTIVE = 'active';
const PASSIVE = 'passive';
const HIDDEN = 'hidden';
const FROZEN = 'frozen';

const TERMINATED = 'terminated';

const toIndexedObject = arr =>
  arr.reduce((acc, val, idx) => {
    acc[val] = idx;
    return acc;
  }, {});

/**
 * @type {!Array<!Object>}
 */
const LEGAL_STATE_TRANSITIONS = [
  [ACTIVE, PASSIVE, HIDDEN, TERMINATED],

  [ACTIVE, PASSIVE, HIDDEN, FROZEN],

  [HIDDEN, PASSIVE, ACTIVE],

  // A frozen page being resumed
  [FROZEN, HIDDEN],

  // A frozen (bfcached) page navigated back to
  // Note: [FROZEN, HIDDEN] can happen here, but it's already covered above.
  [FROZEN, ACTIVE],
  [FROZEN, PASSIVE],
].map(toIndexedObject);

const getLegalStateTransitionPath = (oldState, newState) => {
  for (let order, i = 0; i < LEGAL_STATE_TRANSITIONS.length; i += 1) {
    order = LEGAL_STATE_TRANSITIONS[i];
    const oldIndex = order[oldState];
    const newIndex = order[newState];

    if (oldIndex >= 0 && newIndex >= 0 && newIndex > oldIndex) {
      // Differences greater than one should be reported
      // because it means a state was skipped.
      return Object.keys(order).slice(oldIndex, newIndex + 1);
    }
  }
  return [];
};

let wasActive = false;

const getInternalLifecycleState = (): string => {
  if (document.visibilityState === HIDDEN) {
    return HIDDEN;
  }
  if (document.hasFocus()) {
    return ACTIVE;
  }
  return PASSIVE;
};

export const getCurrentLifecycleState = (): string => {
  if (wasActive) {
    return ACTIVE;
  }
  return getInternalLifecycleState();
};

export default function listenToLifecycleEvents(): void {
  // Detect Safari to work around Safari-specific bugs.
  const IS_SAFARI = !!(window as any).safari?.pushNotification;

  const SUPPORTS_PAGE_TRANSITION_EVENTS = 'onpageshow' in document.body;

  const EVENTS = [
    'focus',
    'blur',
    'visibilitychange',
    'freeze',
    'resume',
    'pageshow',

    SUPPORTS_PAGE_TRANSITION_EVENTS ? 'pagehide' : 'unload',
  ];

  let state = getInternalLifecycleState();
  let safariBeforeUnloadTimeout: number;
  if (state === ACTIVE) {
    wasActive = true;
  }

  const dispatchChangesIfNeeded = (originalEvent: Event, newState: string): void => {
    if (newState === PASSIVE && wasActive) {
      // eslint-disable-next-line no-param-reassign
      newState = ACTIVE;
    }
    if (newState !== state) {
      const oldState = state;
      const path = getLegalStateTransitionPath(oldState, newState);

      for (let i = 0; i < path.length - 1; i += 1) {
        const oldPathState = path[i];
        const newPathState = path[i + 1];

        state = newState;
        if (state === ACTIVE) {
          wasActive = true;
        }

        window.dispatchEvent(
          new CustomEvent('statechange', {
            bubbles: true,
            detail: {
              oldState: oldPathState,
              newState: newPathState,
              originalEvent,
            },
          }),
        );
      }
    }
  };

  const handleEvents = (evt: Event): void => {
    if (IS_SAFARI) {
      clearTimeout(safariBeforeUnloadTimeout);
    }

    switch (evt.type) {
      case 'pageshow':
      case 'resume':
        dispatchChangesIfNeeded(evt, getCurrentLifecycleState());
        break;
      case 'focus':
        if (wasActive) {
          dispatchChangesIfNeeded(evt, ACTIVE);
        }
        break;
      case 'scroll':
      case 'mousedown':
      case 'touchstart':
        dispatchChangesIfNeeded(evt, ACTIVE);
        break;
      case 'blur':
        if (state === ACTIVE) {
          dispatchChangesIfNeeded(evt, getInternalLifecycleState());
        }
        break;
      case 'pagehide':
      case 'unload':
        dispatchChangesIfNeeded(
          evt,
          (evt as PageTransitionEvent).persisted ? FROZEN : TERMINATED,
        );
        break;
      case 'visibilitychange':
        if (state !== FROZEN && state !== TERMINATED) {
          dispatchChangesIfNeeded(evt, getInternalLifecycleState());
        }
        break;
      case 'freeze':
        dispatchChangesIfNeeded(evt, FROZEN);
        break;
    }
  };

  EVENTS.forEach(evt => window.addEventListener(evt, handleEvents, true));
  ['scroll', 'mousedown', 'touchstart'].forEach(evt =>
    window.addEventListener(evt, handleEvents, {
      capture: true,
      once: true,
      passive: true,
    }),
  );

  if (IS_SAFARI) {
    window.addEventListener('beforeunload', evt => {
      safariBeforeUnloadTimeout = window.setTimeout(() => {
        if (!(evt.defaultPrevented || evt.returnValue.length > 0)) {
          dispatchChangesIfNeeded(evt, HIDDEN);
        }
      }, 0);
    });
  }
}
