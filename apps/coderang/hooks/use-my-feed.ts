import { useContext, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AnalyticsContext from '../contexts/analytics-context';
import { AllTagCategoriesData, FeedSettings } from '../graphql/feed-settings';
import { getFeedSettingsQueryKey, getHasAnyFilter } from './use-feed-settings';
import useMutateFilters from './use-mutate-filters';
import { BOOT_QUERY_KEY } from '../contexts/common';
import { AuthEventNames } from '../lib/auth';
import { AnalyticsEvent } from '../lib/analytics';

interface RegisterLocalFilters {
  hasFilters: boolean;
}

interface UseMyFeed {
  registerLocalFilters: (settings?: FeedSettings) => Promise<RegisterLocalFilters>;
}

export function useMyFeed(): UseMyFeed {
  const client = useQueryClient();
  const { updateFeedFilters } = useMutateFilters();
  const { trackEvent } = useContext(AnalyticsContext);

  const registerLocalFilters = async (settings?: FeedSettings) => {
    const key = getFeedSettingsQueryKey();
    const feedSettings =
      settings || client.getQueryData<AllTagCategoriesData>(key)?.feedSettings;

    if (!feedSettings || !getHasAnyFilter(feedSettings)) {
      return { hasFilters: false };
    }

    trackEvent({
      event_name: AnalyticsEvent.CreateFeed,
    });

    try {
      await updateFeedFilters(feedSettings);
      await client.invalidateQueries(BOOT_QUERY_KEY);
    } catch (err) {
      trackEvent({
        event_name: AuthEventNames.RegistrationError,
        extra: JSON.stringify({
          error: JSON.stringify(err),
          origin: 'create my feed mutation error',
        }),
      });
    }

    return { hasFilters: true };
  };

  return useMemo(() => ({ registerLocalFilters }), [registerLocalFilters]);
}
