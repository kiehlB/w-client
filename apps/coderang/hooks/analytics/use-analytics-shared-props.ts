import { MutableRefObject, useContext, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { AnalyticsEvent } from './use-analytics-queue';
import SettingsContext from '../../contexts/settings-context';
import AuthContext from '../../contexts/auth-context';

export default function useAnalyticsSharedProps(
  app: string,
  version: string,
  deviceId: string,
): [MutableRefObject<Partial<AnalyticsEvent>>, boolean] {
  const sharedPropsRef = useRef<Partial<AnalyticsEvent>>();
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id;
  const { themeMode, spaciness, insaneMode } = useContext(SettingsContext);
  const { visit, anonymous, tokenRefreshed, user } = useContext(AuthContext);
  const [sharedPropsSet, setSharedPropsSet] = useState(false);

  const [visitId, setVisitId] = useState<string>();
  useEffect(() => {
    if (tokenRefreshed && !visitId) {
      setVisitId(visit?.visitId);
    }
  }, [tokenRefreshed, visit?.visitId, setVisitId, visitId]);

  useEffect(() => {
    if (!visitId || !deviceId) {
      return;
    }

    const queryObject = { ...searchParams };

    const initialQuerySearchParams = new URLSearchParams(window.location.search);

    initialQuerySearchParams.forEach((value, key) => {
      if (!queryObject[key]) {
        queryObject[key] = value;
      }
    });

    const queryStr = JSON.stringify(queryObject);

    (sharedPropsRef.current?.device_id
      ? Promise.resolve(sharedPropsRef.current.device_id)
      : Promise.resolve(deviceId)
    ).then(_deviceId => {
      sharedPropsRef.current = {
        app_platform: app,
        app_theme: themeMode,
        app_version: version,
        feed_density: spaciness,
        feed_layout: insaneMode ? 'list' : 'cards',
        query_params: queryStr.length > 2 ? queryStr : undefined,
        session_id: visit?.sessionId,
        user_first_visit: anonymous?.firstVisit,
        user_id: anonymous?.id,
        user_referrer: anonymous?.referrer,
        user_registration_date: user?.createdAt,

        visit_id: visitId,
        device_id: _deviceId,
      };
      setSharedPropsSet(true);
    });
  }, [
    sharedPropsRef,
    tokenRefreshed,
    app,
    version,
    themeMode,
    spaciness,
    insaneMode,
    searchParams,
    visit,
    visitId,
    deviceId,
  ]);

  return [sharedPropsRef, sharedPropsSet];
}
