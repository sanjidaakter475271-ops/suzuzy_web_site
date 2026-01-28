import React, { useState } from 'react';
import { ServiceTask } from '../types';
import { Clock, CheckCircle, AlertCircle, Calendar, RefreshCw, Loader2 } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { supabase } from '../lib/supabase';
import { authClient } from '../lib/auth-client';
import { BarcodeScannerComponent } from '../components/BarcodeScanner';
import { Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';

// Mock Data
const MOCK_TASKS: ServiceTask[] = [
  { id: '1', vehicleModel: 'Toyota Corolla', licensePlate: 'DH-K-1234', customerName: 'Rahim Ahmed', status: 'in-progress', issueDescription: 'Engine knocking sound', date: '2023-10-27' },
  { id: '2', vehicleModel: 'Honda Civic', licensePlate: 'CH-GA-5678', customerName: 'Karim Islam', status: 'pending', issueDescription: 'Oil change and general service', date: '2023-10-27' },
  { id: '3', vehicleModel: 'Hyundai Tucson', licensePlate: 'DH-M-9988', customerName: 'Saima Khan', status: 'completed', issueDescription: 'Brake pad replacement', date: '2023-10-26' },
  { id: '4', vehicleModel: 'Suzuki Swift', licensePlate: 'SY-L-1122', customerName: 'Tanvir Hasan', status: 'pending', issueDescription: 'AC cooling issue', date: '2023-10-28' },
];

interface DashboardProps {
  onMenuClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onMenuClick }) => {
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Fetching from 'service_vehicles' or similar table in your schema
      // For now, querying a generic 'service_tasks' table if it exists
      const { data, error } = await supabase
        .from('service_tickets')
        .select(`
          id,
          service_description,
          status,
          created_at,
          vehicle:vehicle_id (
            model_id,
            customer_name,
            chassis_number
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching tasks:", error);
        setTasks(MOCK_TASKS);
      } else if (data) {
        const mappedTasks: ServiceTask[] = data.map((item: any) => ({
          id: item.id,
          vehicleModel: 'Service Ticket', // Would need bike_models join for real name
          licensePlate: item.vehicle?.chassis_number || 'No Chassis',
          customerName: item.vehicle?.customer_name || 'Unknown',
          status: item.status || 'pending',
          issueDescription: item.service_description || 'No description',
          date: new Date(item.created_at).toLocaleDateString()
        }));
        setTasks(mappedTasks);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setTasks(MOCK_TASKS);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTasks();
  }, []);


  const getStatusColor = (status: ServiceTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
    }
  };

  const getStatusIcon = (status: ServiceTask['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="mr-1" />;
      case 'in-progress': return <Clock size={16} className="mr-1" />;
      default: return <AlertCircle size={16} className="mr-1" />;
    }
  };

  const handleScan = async (result: string) => {
    setIsScanning(false);
    console.log("Scanned VIN/Job Card:", result);
    // You can implement logic here to find a task by license plate or VIN
    const { data, error } = await supabase
      .from('service_vehicles')
      .select('*')
      .or(`license_plate.eq.${result},vin.eq.${result}`)
      .single();

    if (data) {
      alert(`Vehicle Found: ${data.model_name}\nCustomer: ${data.customer_name}`);
    } else {
      alert(`No record found for: ${result}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      {isScanning && (
        <BarcodeScannerComponent
          onScan={handleScan}
          onClose={() => setIsScanning(false)}
        />
      )}
      <TopBar onMenuClick={onMenuClick} title="Dashboard" />


      {/* Stats Section */}
      <div className="p-4 grid grid-cols-2 gap-4 animate-slide-up">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors flex items-center justify-between col-span-2" onClick={() => setIsScanning(true)}>
          <div>
            <p className="text-gray-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider font-display">Quick Scan</p>
            <p className="text-sm font-semibold text-blue-500 mt-1">Scan VIN or Job Card</p>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
            <Scan size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
          <p className="text-gray-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider font-display">Pending</p>
          <p className="text-3xl font-bold text-amber-500 mt-2 font-display">
            {tasks.filter(t => t.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
          <p className="text-gray-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider font-display">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2 font-display">
            {tasks.filter(t => t.status === 'in-progress').length}
          </p>
        </div>

      </div>

      <div className="px-4 pb-2 mt-2 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 dark:text-slate-200 mb-3 font-display">Recent Tasks</h2>
        <button
          onClick={fetchTasks}
          disabled={loading}
          className="text-blue-500 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      )}


      {/* Task List */}
      <div className="px-4 space-y-4">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            onClick={() => navigate(RoutePath.JOB_CARD.replace(':id', task.id))}
            className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 active:scale-[0.98] cursor-pointer hover:border-blue-500/30 transition-all duration-100 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900 dark:text-slate-100">{task.vehicleModel}</h3>
              <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center border ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)}
                {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1 font-mono bg-gray-100 dark:bg-slate-800 inline-block px-1.5 py-0.5 rounded text-xs tracking-wider">{task.licensePlate}</p>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-3 line-clamp-2">{task.issueDescription}</p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center text-xs text-gray-400 dark:text-slate-500">
                <Calendar size={12} className="mr-1" />
                {task.date}
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-slate-400">Owner: {task.customerName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};