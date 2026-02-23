import { useState } from 'react';
import { Chrome, Globe, Settings, Users, Activity, Zap, Heart } from 'lucide-react';
import WeatherTimezoneCard from '../components/dashboard/WeatherTimezoneCard';

/**
 * New Tab Page Dashboard for Yumi Browser
 * HeySalad Inc.
 *
 * Simplified dashboard without authentication, routing, or backend dependencies.
 * Designed to be embedded as the browser's default new tab page.
 */

const NTPDashboard = () => {
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('heysalad_weather_api_key') || ''
  );

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('heysalad_weather_api_key', key);
  };

  const quickLinks = [
    {
      title: 'Harmony Dashboard',
      description: 'Full resource management',
      icon: Activity,
      url: 'https://harmony.heysalad.com', // Update with actual URL
      color: 'bg-primary'
    },
    {
      title: 'Team Directory',
      description: 'Find team members',
      icon: Users,
      url: 'https://team.heysalad.com',
      color: 'bg-secondary'
    },
    {
      title: 'Agent Portal',
      description: 'AI agent management',
      icon: Zap,
      url: 'https://agents.heysalad.com',
      color: 'bg-accent'
    },
    {
      title: 'Status Page',
      description: 'System health',
      icon: Heart,
      url: 'https://status.heysalad.com',
      color: 'bg-green-500'
    },
  ];

  const stats = [
    { label: 'Active Agents', value: '—', icon: Zap, color: 'bg-primary' },
    { label: 'Tasks Today', value: '—', icon: Activity, color: 'bg-secondary' },
    { label: 'Team Members', value: '—', icon: Users, color: 'bg-accent' },
    { label: 'Locations', value: '—', icon: Globe, color: 'bg-green-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-2xl">🥗</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HeySalad Harmony</h1>
                <p className="text-xs text-gray-600">Yumi Browser</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const key = prompt('Enter OpenWeatherMap API Key (optional):');
                  if (key !== null) {
                    handleApiKeyChange(key);
                    window.location.reload();
                  }
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Welcome Message */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to Yumi
          </h2>
          <p className="text-gray-600 mt-1">
            Your HeySalad command center
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Offline mode
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Weather/Timezone Card */}
        <WeatherTimezoneCard apiKey={apiKey || undefined} />

        {/* Quick Links */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <Chrome className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 border border-gray-200 rounded-lg hover:shadow-lg hover:border-primary/50 transition-all"
              >
                <div className="flex flex-col h-full">
                  <div className={`${link.color} p-3 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform`}>
                    <link.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{link.title}</h4>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">
            Built with Yumi Browser • HeySalad Inc.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Version 1.0.0 • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NTPDashboard;
