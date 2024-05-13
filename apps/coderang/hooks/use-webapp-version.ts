'use client';

import { useEffect, useState } from 'react';

import { ParsedUrlQuery } from 'querystring';
import { useParams, useSearchParams } from 'next/navigation';

const getVersion = (query: ParsedUrlQuery): string | undefined => {
  if (query.android) {
    return 'android';
  }
  if (query.pwa) {
    return 'pwa';
  }
  return undefined;
};

export default function useWebappVersion(): string {
  const params = useParams();
  const searchParams = useSearchParams();
  const [version, setVersion] = useState<string>();

  const id = params.id as any;

  useEffect(() => {
    if (Object.keys(searchParams).length > 0 && !version) {
      setVersion(getVersion(id));
    }
  }, [id, version]);

  return version;
}
