import React, { useState, useEffect } from 'react';
import { Save, Loader2, RefreshCw, Search } from 'lucide-react';
import api from '../config/axios';
import ManageKeywords from './ManageKeywords';

interface Settings {
  _id: string;
  appName: string;
  razorpay_id: string;
  razorpay_secret: string;
  showSubmitClassified: boolean;
  showSubmitObituary: boolean;
  showSubmitEvent: boolean;
  eventPrice: number;
  obituaryPrice: number;
  classifiedPrice: number;
  enableWallet: boolean;
  visibleScreenShot: boolean;
  enableClassifiedPreview: boolean;
  enableObituaryPreview: boolean;
  viewsVisible: boolean;
  androidAppVersion: string;
  iosAppVersion: string;
  suddiMinCount: number;
  suddiMaxCount: number;
  suddiVaividhyaMinCount: number;
  suddiVaividhyaMaxCount: number;
  antharashtriyaMinCount: number;
  antharashtriyaMaxCount: number;
  chitradalliSuddiMinCount: number;
  chitradalliSuddiMaxCount: number;
  lekhanaMinCount: number;
  lekhanaMaxCount: number;
  odhugaraPatraMinCount: number;
  odhugaraPatraMaxCount: number;
  rajakiyaMinCount: number;
  rajakiyaMaxCount: number;
  rajyaRashtraMinCount: number;
  rajyaRashtraMaxCount: number;
  sankshipthaMinCount: number;
  sankshipthaMaxCount: number;
}

interface SystemSettingsProps {
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ showAlert }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCrawlerSettings, setShowCrawlerSettings] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/v1/app/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      showAlert('Failed to load system settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSettings();
    setRefreshing(false);
    showAlert('Settings refreshed successfully', 'success');
  };

  const handleInputChange = (field: keyof Settings, value: string | boolean | number) => {
    if (settings) {
      setSettings({
        ...settings,
        [field]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!settings) return;

    setSaving(true);

    try {
      const updateData = {
        showSubmitClassified: settings.showSubmitClassified,
        showSubmitObituary: settings.showSubmitObituary,
        showSubmitEvent: settings.showSubmitEvent,
        eventPrice: settings.eventPrice,
        obituaryPrice: settings.obituaryPrice,
        classifiedPrice: settings.classifiedPrice,
        enableWallet: settings.enableWallet,
        visibleScreenShot: settings.visibleScreenShot,
        enableClassifiedPreview: settings.enableClassifiedPreview,
        enableObituaryPreview: settings.enableObituaryPreview,
        viewsVisible: settings.viewsVisible,
        androidAppVersion: settings.androidAppVersion,
        iosAppVersion: settings.iosAppVersion,
        suddiMinCount: settings.suddiMinCount,
        suddiMaxCount: settings.suddiMaxCount,
        suddiVaividhyaMinCount: settings.suddiVaividhyaMinCount,
        suddiVaividhyaMaxCount: settings.suddiVaividhyaMaxCount,
        antharashtriyaMinCount: settings.antharashtriyaMinCount,
        antharashtriyaMaxCount: settings.antharashtriyaMaxCount,
        chitradalliSuddiMinCount: settings.chitradalliSuddiMinCount,
        chitradalliSuddiMaxCount: settings.chitradalliSuddiMaxCount,
        lekhanaMinCount: settings.lekhanaMinCount,
        lekhanaMaxCount: settings.lekhanaMaxCount,
        odhugaraPatraMinCount: settings.odhugaraPatraMinCount,
        odhugaraPatraMaxCount: settings.odhugaraPatraMaxCount,
        rajakiyaMinCount: settings.rajakiyaMinCount,
        rajakiyaMaxCount: settings.rajakiyaMaxCount,
        rajyaRashtraMinCount: settings.rajyaRashtraMinCount,
        rajyaRashtraMaxCount: settings.rajyaRashtraMaxCount,
        sankshipthaMinCount: settings.sankshipthaMinCount,
        sankshipthaMaxCount: settings.sankshipthaMaxCount
      };

      await api.put(`/v1/app/settings/${settings._id}`, updateData);
      showAlert('Settings updated successfully', 'success');
      await fetchSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      showAlert('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">No settings found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-black shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">App Information</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">App Name:</span>
                <span className="ml-2 text-gray-900">{settings.appName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Settings ID:</span>
                <span className="ml-2 text-gray-500 font-mono text-xs">{settings._id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Android Version:</span>
                <span className="ml-2 text-gray-900">{settings.androidAppVersion}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">iOS Version:</span>
                <span className="ml-2 text-gray-900">{settings.iosAppVersion}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Gateway</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Razorpay ID:</span>
                <span className="ml-2 text-gray-900 font-mono text-xs">{settings.razorpay_id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Razorpay Secret:</span>
                <span className="ml-2 text-gray-500">••••••••••••••••</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Toggles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border border-gray-300 rounded">
              <label className="text-sm font-medium text-gray-700">Show Submit Classified</label>
              <input
                type="checkbox"
                checked={settings.showSubmitClassified}
                onChange={(e) => handleInputChange('showSubmitClassified', e.target.checked)}
                className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-300 rounded">
              <label className="text-sm font-medium text-gray-700">Show Submit Obituary</label>
              <input
                type="checkbox"
                checked={settings.showSubmitObituary}
                onChange={(e) => handleInputChange('showSubmitObituary', e.target.checked)}
                className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-300 rounded">
              <label className="text-sm font-medium text-gray-700">Show Submit Event</label>
              <input
                type="checkbox"
                checked={settings.showSubmitEvent}
                onChange={(e) => handleInputChange('showSubmitEvent', e.target.checked)}
                className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-300 rounded">
              <label className="text-sm font-medium text-gray-700">Enable Wallet</label>
              <input
                type="checkbox"
                checked={settings.enableWallet}
                onChange={(e) => handleInputChange('enableWallet', e.target.checked)}
                className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-300 rounded">
              <label className="text-sm font-medium text-gray-700">Visible Screenshot</label>
              <input
                type="checkbox"
                checked={settings.visibleScreenShot}
                onChange={(e) => handleInputChange('visibleScreenShot', e.target.checked)}
                className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-300 rounded">
              <label className="text-sm font-medium text-gray-700">Enable Classified Preview</label>
              <input
                type="checkbox"
                checked={settings.enableClassifiedPreview}
                onChange={(e) => handleInputChange('enableClassifiedPreview', e.target.checked)}
                className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-300 rounded">
              <label className="text-sm font-medium text-gray-700">Enable Obituary Preview</label>
              <input
                type="checkbox"
                checked={settings.enableObituaryPreview}
                onChange={(e) => handleInputChange('enableObituaryPreview', e.target.checked)}
                className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-300 rounded">
              <label className="text-sm font-medium text-gray-700">Views Visible</label>
              <input
                type="checkbox"
                checked={settings.viewsVisible}
                onChange={(e) => handleInputChange('viewsVisible', e.target.checked)}
                className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">App Versions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Android App Version
              </label>
              <input
                type="text"
                value={settings.androidAppVersion}
                onChange={(e) => handleInputChange('androidAppVersion', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g., 32.0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                iOS App Version
              </label>
              <input
                type="text"
                value={settings.iosAppVersion}
                onChange={(e) => handleInputChange('iosAppVersion', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g., 17.0.0"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.eventPrice}
                onChange={(e) => handleInputChange('eventPrice', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Obituary Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.obituaryPrice}
                onChange={(e) => handleInputChange('obituaryPrice', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classified Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.classifiedPrice}
                onChange={(e) => handleInputChange('classifiedPrice', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category News Count Limits</h2>

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-md font-medium text-gray-800 mb-3">Suddi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.suddiMinCount}
                    onChange={(e) => handleInputChange('suddiMinCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.suddiMaxCount}
                    onChange={(e) => handleInputChange('suddiMaxCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-md font-medium text-gray-800 mb-3">Suddi Vaividhya</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.suddiVaividhyaMinCount}
                    onChange={(e) => handleInputChange('suddiVaividhyaMinCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.suddiVaividhyaMaxCount}
                    onChange={(e) => handleInputChange('suddiVaividhyaMaxCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-md font-medium text-gray-800 mb-3">Antharashtriya</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.antharashtriyaMinCount}
                    onChange={(e) => handleInputChange('antharashtriyaMinCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.antharashtriyaMaxCount}
                    onChange={(e) => handleInputChange('antharashtriyaMaxCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-md font-medium text-gray-800 mb-3">Chitradalli Suddi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.chitradalliSuddiMinCount}
                    onChange={(e) => handleInputChange('chitradalliSuddiMinCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.chitradalliSuddiMaxCount}
                    onChange={(e) => handleInputChange('chitradalliSuddiMaxCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-md font-medium text-gray-800 mb-3">Lekhana</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.lekhanaMinCount}
                    onChange={(e) => handleInputChange('lekhanaMinCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.lekhanaMaxCount}
                    onChange={(e) => handleInputChange('lekhanaMaxCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-md font-medium text-gray-800 mb-3">Odhugara Patra</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.odhugaraPatraMinCount}
                    onChange={(e) => handleInputChange('odhugaraPatraMinCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.odhugaraPatraMaxCount}
                    onChange={(e) => handleInputChange('odhugaraPatraMaxCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-md font-medium text-gray-800 mb-3">Rajakiya</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.rajakiyaMinCount}
                    onChange={(e) => handleInputChange('rajakiyaMinCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.rajakiyaMaxCount}
                    onChange={(e) => handleInputChange('rajakiyaMaxCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-md font-medium text-gray-800 mb-3">Rajya Rashtra</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.rajyaRashtraMinCount}
                    onChange={(e) => handleInputChange('rajyaRashtraMinCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.rajyaRashtraMaxCount}
                    onChange={(e) => handleInputChange('rajyaRashtraMaxCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-md font-medium text-gray-800 mb-3">Sankshiptha</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.sankshipthaMinCount}
                    onChange={(e) => handleInputChange('sankshipthaMinCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Count</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.sankshipthaMaxCount}
                    onChange={(e) => handleInputChange('sankshipthaMaxCount', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-6 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <button
          onClick={() => setShowCrawlerSettings(!showCrawlerSettings)}
          className="flex items-center justify-between w-full px-6 py-4 bg-white border border-black shadow-sm hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <Search className="w-6 h-6 mr-3 text-black" />
            <h2 className="text-xl font-bold text-gray-900">Janathavani Crawler</h2>
          </div>
          <span className="text-sm text-gray-600">
            {showCrawlerSettings ? 'Hide' : 'Show'} Crawler Settings
          </span>
        </button>

        {showCrawlerSettings && (
          <div className="mt-4 bg-white border border-black shadow-sm p-6">
            <ManageKeywords showAlert={showAlert} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;
