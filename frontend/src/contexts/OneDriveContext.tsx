import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicClientApplication, AccountInfo, AuthenticationResult, InteractionType } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import { msalConfig, loginRequest } from '../config/msalConfig';

// Types
interface OneDriveFile {
  id: string;
  name: string;
  size: number;
  webUrl: string;
  downloadUrl?: string;
  lastModifiedDateTime: string;
  folder?: any;
  file?: any;
}

interface OneDriveContextType {
  // Authentication state
  isAuthenticated: boolean;
  account: AccountInfo | null;
  
  // Connection methods
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  
  // File operations
  listFiles: (folderId?: string) => Promise<OneDriveFile[]>;
  uploadFile: (file: File, folderId?: string) => Promise<OneDriveFile>;
  downloadFile: (fileId: string) => Promise<Blob>;
  createFolder: (name: string, parentFolderId?: string) => Promise<OneDriveFile>;
  
  // Status
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const OneDriveContext = createContext<OneDriveContextType | undefined>(undefined);

// MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

interface OneDriveProviderProps {
  children: ReactNode;
}

export const OneDriveProvider: React.FC<OneDriveProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [graphClient, setGraphClient] = useState<Client | null>(null);

  // Initialize MSAL and check for existing authentication
  useEffect(() => {
    const initialize = async () => {
      try {
        await msalInstance.initialize();
        
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsAuthenticated(true);
          await initializeGraphClient(accounts[0]);
        }
      } catch (err) {
        console.error('MSAL initialization error:', err);
        setError('Failed to initialize authentication');
      }
    };

    initialize();
  }, []);

  const initializeGraphClient = async (userAccount: AccountInfo) => {
    try {
      // Create an authentication provider
      const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
        msalInstance,
        {
          account: userAccount,
          scopes: loginRequest.scopes,
          interactionType: InteractionType.Popup,
        }
      );

      // Create Graph client
      const client = Client.initWithMiddleware({ authProvider });
      setGraphClient(client);
    } catch (err) {
      console.error('Graph client initialization error:', err);
      setError('Failed to initialize Graph client');
    }
  };

  const signIn = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response: AuthenticationResult = await msalInstance.loginPopup(loginRequest);
      
      if (response.account) {
        setAccount(response.account);
        setIsAuthenticated(true);
        await initializeGraphClient(response.account);
        console.log('OneDrive sign-in successful');
      }
    } catch (err: any) {
      console.error('OneDrive sign-in error:', err);
      setError(err.message || 'Failed to sign in to OneDrive');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (account) {
        await msalInstance.logoutPopup({
          account,
          postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri,
        });
      }
      
      setAccount(null);
      setIsAuthenticated(false);
      setGraphClient(null);
      console.log('OneDrive sign-out successful');
    } catch (err: any) {
      console.error('OneDrive sign-out error:', err);
      setError(err.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const listFiles = async (folderId: string = 'root'): Promise<OneDriveFile[]> => {
    if (!graphClient) {
      throw new Error('Not authenticated with OneDrive');
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = folderId === 'root' 
        ? '/me/drive/root/children'
        : `/me/drive/items/${folderId}/children`;

      const response = await graphClient.api(endpoint).get();
      
      const files: OneDriveFile[] = response.value.map((item: any) => ({
        id: item.id,
        name: item.name,
        size: item.size || 0,
        webUrl: item.webUrl,
        downloadUrl: item['@microsoft.graph.downloadUrl'],
        lastModifiedDateTime: item.lastModifiedDateTime,
        folder: item.folder,
        file: item.file,
      }));

      return files;
    } catch (err: any) {
      console.error('Error listing OneDrive files:', err);
      setError(err.message || 'Failed to list files');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, folderId: string = 'root'): Promise<OneDriveFile> => {
    if (!graphClient) {
      throw new Error('Not authenticated with OneDrive');
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = folderId === 'root'
        ? `/me/drive/root:/${file.name}:/content`
        : `/me/drive/items/${folderId}:/${file.name}:/content`;

      const response = await graphClient.api(endpoint).put(file);

      const uploadedFile: OneDriveFile = {
        id: response.id,
        name: response.name,
        size: response.size,
        webUrl: response.webUrl,
        downloadUrl: response['@microsoft.graph.downloadUrl'],
        lastModifiedDateTime: response.lastModifiedDateTime,
        folder: response.folder,
        file: response.file,
      };

      return uploadedFile;
    } catch (err: any) {
      console.error('Error uploading file to OneDrive:', err);
      setError(err.message || 'Failed to upload file');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (fileId: string): Promise<Blob> => {
    if (!graphClient) {
      throw new Error('Not authenticated with OneDrive');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await graphClient.api(`/me/drive/items/${fileId}/content`).get();
      return response;
    } catch (err: any) {
      console.error('Error downloading file from OneDrive:', err);
      setError(err.message || 'Failed to download file');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async (name: string, parentFolderId: string = 'root'): Promise<OneDriveFile> => {
    if (!graphClient) {
      throw new Error('Not authenticated with OneDrive');
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = parentFolderId === 'root'
        ? '/me/drive/root/children'
        : `/me/drive/items/${parentFolderId}/children`;

      const folder = {
        name: name,
        folder: {},
      };

      const response = await graphClient.api(endpoint).post(folder);

      const createdFolder: OneDriveFile = {
        id: response.id,
        name: response.name,
        size: response.size || 0,
        webUrl: response.webUrl,
        lastModifiedDateTime: response.lastModifiedDateTime,
        folder: response.folder,
        file: response.file,
      };

      return createdFolder;
    } catch (err: any) {
      console.error('Error creating folder in OneDrive:', err);
      setError(err.message || 'Failed to create folder');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: OneDriveContextType = {
    isAuthenticated,
    account,
    signIn,
    signOut,
    listFiles,
    uploadFile,
    downloadFile,
    createFolder,
    loading,
    error,
    clearError,
  };

  return (
    <OneDriveContext.Provider value={contextValue}>
      {children}
    </OneDriveContext.Provider>
  );
};

// Custom hook to use OneDrive context
export const useOneDrive = (): OneDriveContextType => {
  const context = useContext(OneDriveContext);
  if (!context) {
    throw new Error('useOneDrive must be used within a OneDriveProvider');
  }
  return context;
};