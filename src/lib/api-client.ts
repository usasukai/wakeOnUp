import { Machine } from './storage';

interface ErrorResponse {
  error: string;
}

// Define the shape of the Electron API exposed via contextBridge
interface ElectronAPI {
  getMachines: () => Promise<Machine[]>;
  addMachine: (data: { name: string; mac: string }) => Promise<Machine>;
  deleteMachine: (id: string) => Promise<void>;
  wake: (mac: string) => Promise<void>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export const apiClient = {
  getMachines: async (): Promise<Machine[]> => {
    if (window.electron) {
      return window.electron.getMachines();
    }
    const res = await fetch('/api/machines');
    if (!res.ok) throw new Error('Failed to fetch machines');
    return res.json();
  },

  addMachine: async (name: string, mac: string): Promise<Machine> => {
    // Note: ID generation happens on backend/main process
    if (window.electron) {
      // In Electron, we might send partial data and let main process handle ID
      // We'll define addMachine IPC to take {name, mac} and return Machine.
      // We need to cast window.electron because TS doesn't know about it being potentially undefined here fully correctly or just to be safe
      return window.electron.addMachine({ name, mac });
    }

    const res = await fetch('/api/machines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mac }),
    });
    if (!res.ok) {
       const err: ErrorResponse = await res.json();
       throw new Error(err.error || 'Failed to add machine');
    }
    return res.json();
  },

  deleteMachine: async (id: string): Promise<void> => {
    if (window.electron) {
      return window.electron.deleteMachine(id);
    }
    const res = await fetch(`/api/machines/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete machine');
  },

  wake: async (mac: string): Promise<void> => {
    if (window.electron) {
      return window.electron.wake(mac);
    }
    const res = await fetch('/api/wake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mac }),
    });
    if (!res.ok) throw new Error('Failed to wake machine');
  },
};
