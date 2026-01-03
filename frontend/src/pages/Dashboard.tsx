import { Users, Calendar, Clock, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Total Employees', value: '1,234', icon: Users, color: 'bg-blue-500' },
    { label: 'On Leave Today', value: '12', icon: Calendar, color: 'bg-orange-500' },
    { label: 'Pending Requests', value: '5', icon: Clock, color: 'bg-yellow-500' },
    { label: 'Payroll Processed', value: '$1.2M', icon: DollarSign, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Welcome back, Admin</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                <stat.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Leave Statistics</h2>
          <div className="flex items-center justify-center h-full text-gray-400">
            Chart Placeholder
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                 <div className="w-10 h-10 rounded-full bg-gray-200" />
                 <div>
                   <p className="text-sm font-medium text-gray-800">John Doe requested leave</p>
                   <p className="text-xs text-gray-500">2 hours ago</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
