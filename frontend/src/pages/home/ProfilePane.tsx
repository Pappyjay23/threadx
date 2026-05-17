import { FiUser, FiShield, FiBell, FiArrowLeft } from 'react-icons/fi';

interface ProfilePaneProps {
  onBack?: () => void;
}

const ProfilePane = ({ onBack }: ProfilePaneProps) => {
  return (
    <div className="flex-1 bg-workspace-noise h-full overflow-y-auto p-4 md:p-8 text-white">
      <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="md:hidden p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg">
              <FiArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        </div>

        <div className="bg-[#0c0926]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#7556d3] to-[#a286f7] flex items-center justify-center text-xl font-bold text-white shadow-xl shadow-black/40">
            PJ
          </div>
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-lg font-semibold">Peace Jinadu-Paul</h2>
            <p className="text-sm text-white/40">peace@piseye.studio</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0c0926]/20 border border-white/5 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#a286f7]">
              <FiUser className="h-4 w-4" />
              <h3 className="text-sm font-semibold">Preferences</h3>
            </div>
            <p className="text-xs text-white/40">Configure theme, viewport configurations, scaling layers and developer console nodes.</p>
          </div>

          <div className="bg-[#0c0926]/20 border border-white/5 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#a286f7]">
              <FiBell className="h-4 w-4" />
              <h3 className="text-sm font-semibold">System Alerts</h3>
            </div>
            <p className="text-xs text-white/40">Manage push messaging infrastructure channels, internal service logs and sound arrays.</p>
          </div>

          <div className="bg-[#0c0926]/20 border border-white/5 rounded-xl p-5 space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-[#a286f7]">
              <FiShield className="h-4 w-4" />
              <h3 className="text-sm font-semibold">Security Token Hierarchy</h3>
            </div>
            <p className="text-xs text-white/40">Manage authenticated JWT key lifecycles, cross-device logging and rate-limiting thresholds.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePane;