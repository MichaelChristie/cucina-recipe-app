import React, { useState, useEffect } from 'react';
import { restoreRecipeData } from '../services/recipeService';
import { backupService } from '../services/backupService';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import AdminLayout from '../components/AdminLayout';

interface Backup {
  id: string;
  timestamp: string;
  recipes: Record<string, any>;
}

export const AdminUtils = () => {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string>('');
  const [confirmRestore, setConfirmRestore] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const backupsSnapshot = await getDocs(collection(db, 'backups'));
      const backupsData = backupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Backup[];
      
      // Sort backups by timestamp, most recent first
      backupsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setBackups(backupsData);
    } catch (error) {
      console.error('Error fetching backups:', error);
      setStatus('Error fetching backups');
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsLoading(true);
      setStatus('Creating backup...');
      const backup = await backupService.createBackup();
      await fetchBackups(); // Refresh the backups list
      setStatus('Backup created successfully!');
    } catch (error) {
      setStatus(`Error creating backup: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupSelect = (backupId: string) => {
    setSelectedBackup(backupId);
    setConfirmRestore(false); // Reset confirmation when selecting new backup
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) {
      setStatus('Please select a backup to restore');
      return;
    }

    try {
      setIsLoading(true);
      setStatus('Restoring from backup...');
      await backupService.restoreFromBackup(selectedBackup);
      setStatus('Backup restored successfully!');
      setConfirmRestore(false);
      setSelectedBackup('');
    } catch (error) {
      setStatus(`Error restoring backup: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleGenerateDummyData = async () => {
    try {
      setIsLoading(true);
      setStatus('Generating dummy data...');
      await restoreRecipeData();
      setStatus('Dummy data generated successfully! Recipes have been updated with ingredients and steps.');
    } catch (error) {
      setStatus(`Error generating dummy data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Database Utilities</h1>
        
        <div className="space-y-6">
          {/* Data Generation */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Data Generation</h2>
            <button
              onClick={handleGenerateDummyData}
              disabled={isLoading}
              className="bg-purple-500 text-white px-4 py-2 rounded disabled:bg-gray-400 
                       hover:bg-purple-600 transition-colors"
            >
              {isLoading ? 'Generating...' : 'Generate Dummy Data'}
            </button>
            <p className="mt-2 text-sm text-gray-500">
              This will add random ingredients and steps to recipes that are missing them.
            </p>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          {/* Backup Creation */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Backup Management</h2>
            <div className="flex gap-4">
              <button
                onClick={handleCreateBackup}
                disabled={isLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 
                         hover:bg-blue-600 transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create New Backup'}
              </button>
            </div>
          </div>

          {/* Backup List with Selection */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Available Backups</h2>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backups.map((backup) => (
                    <tr 
                      key={backup.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedBackup === backup.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleBackupSelect(backup.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="radio"
                          name="backup-selection"
                          checked={selectedBackup === backup.id}
                          onChange={() => handleBackupSelect(backup.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(backup.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Object.keys(backup.recipes || {}).length} recipes
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Restore Controls */}
            {selectedBackup && (
              <div className="mt-4 space-y-4">
                {!confirmRestore ? (
                  <button
                    onClick={() => setConfirmRestore(true)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded
                             hover:bg-yellow-600 transition-colors"
                  >
                    Review Selected Backup
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                      <p className="text-yellow-800">
                        Are you sure you want to restore this backup? This will overwrite current data.
                      </p>
                      <p className="text-sm text-yellow-600 mt-2">
                        Selected backup: {formatDate(backups.find(b => b.id === selectedBackup)?.timestamp || '')}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={handleRestoreBackup}
                        disabled={isLoading}
                        className="bg-green-500 text-white px-4 py-2 rounded
                                 hover:bg-green-600 transition-colors disabled:bg-gray-400"
                      >
                        {isLoading ? 'Restoring...' : 'Confirm Restore'}
                      </button>
                      <button
                        onClick={() => setConfirmRestore(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded
                                 hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Messages */}
          {status && (
            <div className="mt-4 p-4 border rounded bg-gray-50">
              {status}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}; 