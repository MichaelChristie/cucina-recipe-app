import AdminLayout from '../../components/AdminLayout';
import { Link } from 'react-router-dom';
export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900">Total Recipes</h3>
            <p className="text-3xl font-bold text-blue-600">123</p>
            <Link to="/admin/recipes" className="text-blue-600 hover:underline">View Recipes</Link>
          <div className="mt-4">
            <div className="h-32 flex items-end space-x-2">
              <div className="w-8 bg-blue-200 h-[30%]"></div>
              <div className="w-8 bg-blue-300 h-[50%]"></div>
              <div className="w-8 bg-blue-400 h-[40%]"></div>
              <div className="w-8 bg-blue-500 h-[75%]"></div>
              <div className="w-8 bg-blue-600 h-[60%]"></div>
              <div className="w-8 bg-blue-700 h-[80%]"></div>
            </div>
            <div className="flex justify-between text-xs text-blue-600 mt-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
          </div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-green-900">Active Users</h3>
            <p className="text-3xl font-bold text-green-600">456</p>
            <Link to="/admin/users" className="text-green-600 hover:underline">View Users</Link>
          <div className="mt-4">
            <div className="h-32 flex items-end space-x-2">
              <div className="w-8 bg-green-200 h-[20%]"></div>
              <div className="w-8 bg-green-300 h-[45%]"></div>
              <div className="w-8 bg-green-400 h-[35%]"></div>
              <div className="w-8 bg-green-500 h-[70%]"></div>
              <div className="w-8 bg-green-600 h-[55%]"></div>
              <div className="w-8 bg-green-700 h-[85%]"></div>
            </div>
            <div className="flex justify-between text-xs text-green-600 mt-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
          </div>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-purple-900">Total Views</h3>
            <p className="text-3xl font-bold text-purple-600">789</p>
            <Link to="/admin/views" className="text-purple-600 hover:underline">View Views</Link>
          <div className="mt-4">
            <div className="h-32 flex items-end space-x-2">
              <div className="w-8 bg-purple-200 h-[40%]"></div>
              <div className="w-8 bg-purple-300 h-[60%]"></div>
              <div className="w-8 bg-purple-400 h-[45%]"></div>
              <div className="w-8 bg-purple-500 h-[80%]"></div>
              <div className="w-8 bg-purple-600 h-[65%]"></div>
              <div className="w-8 bg-purple-700 h-[90%]"></div>
            </div>
            <div className="flex justify-between text-xs text-purple-600 mt-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
          </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 