import React, { ReactElement, ReactNode, createContext, useRef, useContext } from 'react';
import useAnalyticsQueue, {
  AnalyticsEvent,
} from '../hooks/analytics/use-analytics-queue';
import useAnalyticsSharedProps from '../hooks/analytics/use-analytics-shared-props';
import useAnalyticsContextData, {
  AnalyticsContextData,
} from '../hooks/analytics/use-analytics-context-data';
import useBackfillPendingEvents from '../hooks/analytics/use-backfill-pending-events';
import useTrackLifecycleEvents from '../hooks/analytics/use-track-lifecycle-events';
import { BootApp } from '../lib/boot';

const AnalyticsContext = createContext<AnalyticsContextData>({
  trackEvent: () => {},
  trackEventStart: () => {},
  trackEventEnd: () => {},
  sendBeacon: () => {},
});
export default AnalyticsContext;

export type AnalyticsContextProviderProps = {
  app: BootApp;
  getPage: () => string;
  version?: string;
  fetchMethod?: typeof fetch;
  backgroundMethod?: (msg: unknown) => Promise<unknown>;
  deviceId?: string;
  children?: ReactNode;
};

export const AnalyticsContextProvider = ({
  app,
  version,
  children,
  fetchMethod = fetch,
  backgroundMethod,
  deviceId,
  getPage,
}: AnalyticsContextProviderProps): ReactElement => {
  const { pushToQueue, setEnabled, queueRef, sendBeacon } = useAnalyticsQueue({
    fetchMethod,
    backgroundMethod,
  });
  const [sharedPropsRef, sharedPropsSet] = useAnalyticsSharedProps(
    app,
    version,
    deviceId,
  );
  const durationEventsQueue = useRef<Map<string, AnalyticsEvent>>(new Map());
  const contextData = useAnalyticsContextData(
    pushToQueue,
    sharedPropsRef,
    getPage,
    durationEventsQueue,
    sendBeacon,
  );
  useBackfillPendingEvents(
    sharedPropsRef,
    sharedPropsSet,
    queueRef,
    durationEventsQueue,
    setEnabled,
  );
  useTrackLifecycleEvents(setEnabled, contextData, durationEventsQueue, sendBeacon);

  return (
    <AnalyticsContext.Provider value={contextData}>{children}</AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = (): AnalyticsContextData =>
  useContext(AnalyticsContext);
