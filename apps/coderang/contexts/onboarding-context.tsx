'use client';

import React, {
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { AnalyticsEvent } from '../lib/analytics';
import { OnboardingMode } from '../graphql/feed';
import { useMyFeed } from '../hooks/use-my-feed';
import usePersistentContext from '../hooks/use-persistent-context';
import AuthContext from './auth-context';
import { isTesting } from '../lib/constants';
import useSidebarRendered from '../hooks/use-sidebar-rendered';
import { ExperimentWinner } from '../lib/feature-values';
import AlertContext from './alert-context';
import AnalyticsContext from './analytics-context';

const LOGGED_USER_ONBOARDING = 'hasTriedOnboarding';

export interface OnboardingContextData {
  myFeedMode: OnboardingMode;
  isOnboardingOpen: boolean;
  showArticleOnboarding?: boolean;
  onCloseOnboardingModal: () => void;
  onShouldUpdateFilters: Dispatch<SetStateAction<boolean>>;
  onInitializeOnboarding: (onFinish?: () => void, skipIntro?: boolean) => void;
  onStartArticleOnboarding: () => void;
  shouldSkipIntro: boolean;
}

const OnboardingContext = React.createContext<OnboardingContextData>(null);

interface OnboardingContextProviderProps {
  children: ReactNode;
}

export const OnboardingContextProvider = ({
  children,
}: OnboardingContextProviderProps): ReactElement => {
  const { user } = useContext(AuthContext);
  const { alerts } = useContext(AlertContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const { registerLocalFilters } = useMyFeed();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isRegisteringFilters, setIsRegisteringFilters] = useState(false);
  const [shouldUpdateFilters, setShouldUpdateFilters] = useState(false);
  const [onboardingMode] = useState(OnboardingMode.Manual);
  const onFeedPageChanged = useRef(null);
  const [hasTriedOnboarding, setHasTriedOnboarding] = usePersistentContext<boolean>(
    LOGGED_USER_ONBOARDING,
    !alerts.filter,
  );
  const [shouldSkipIntro, setSkipIntro] = useState(false);

  const onInitializeOnboarding = (onFinish: () => void, skipIntro?: boolean) => {
    if (onFinish) {
      onFeedPageChanged.current = onFinish;
    }

    if (skipIntro) {
      setSkipIntro(true);
    }

    setIsOnboarding(true);
  };
  const { sidebarRendered } = useSidebarRendered();
  const showArticleOnboarding = sidebarRendered && alerts?.filter;
  const onStartArticleOnboarding = () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickArticleAnonymousCTA,
      target_id: ExperimentWinner.ArticleOnboarding,
      extra: JSON.stringify({ origin: window.origin }),
    });
    onInitializeOnboarding(null);
  };

  useEffect(() => {
    if (!user || !shouldUpdateFilters || isRegisteringFilters) {
      return;
    }

    setIsRegisteringFilters(true);
    registerLocalFilters().then(() => {
      setShouldUpdateFilters(false);
      setIsOnboarding(false);
      setIsRegisteringFilters(false);
      setSkipIntro(false);
    });
  }, [user, shouldUpdateFilters, isRegisteringFilters]);

  const onCloseOnboardingModal = () => {
    if (onboardingMode === OnboardingMode.Auto) {
      trackEvent({ event_name: AnalyticsEvent.OnboardingSkip });
    }

    if (!hasTriedOnboarding) {
      setHasTriedOnboarding(true);
    }

    setIsOnboarding(false);
    setSkipIntro(false);

    if (user && !alerts.filter && onFeedPageChanged.current) {
      onFeedPageChanged.current?.();
    }
  };

  const onboardingContextData = useMemo<OnboardingContextData>(
    () => ({
      onStartArticleOnboarding,
      myFeedMode: onboardingMode,
      isOnboardingOpen: isOnboarding,
      showArticleOnboarding,
      onCloseOnboardingModal,
      onShouldUpdateFilters: setShouldUpdateFilters,
      onInitializeOnboarding,
      shouldSkipIntro,
    }),

    [isOnboarding, user, alerts, onboardingMode, shouldUpdateFilters, shouldSkipIntro],
  );

  return (
    <OnboardingContext.Provider value={onboardingContextData}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboardingContext = (): OnboardingContextData =>
  useContext(OnboardingContext);

export default OnboardingContext;
