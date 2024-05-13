import { Permissions } from 'webextension-polyfill';
import React, { useContext } from 'react';

export type RequestContentScripts = (data: {
  origin: string;
  skipRedirect?: boolean;
}) => Promise<boolean>;

export interface ExtensionContextData {
  getContentScriptPermission?: () => Promise<boolean>;
  requestContentScripts?: RequestContentScripts;
  registerBrowserContentScripts?: () => Promise<void>;
  getHostPermission?: () => Promise<boolean>;
  requestHostPermissions?: Permissions.Static['request'];
  origins?: string[];
  currentPage?: string;
  setCurrentPage?: React.Dispatch<React.SetStateAction<string>>;
}

export const ExtensionContext = React.createContext<ExtensionContextData>({});

export const useExtensionContext = (): ExtensionContextData =>
  useContext(ExtensionContext);
