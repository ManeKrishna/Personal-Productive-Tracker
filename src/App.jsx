import React, { useState, useEffect } from 'react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { Calendar, CheckCircle2, Circle, Plus, X, LogOut, User } from 'lucide-react';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDINs7flONNZyrjv5B-uHKVjx5lyLZV9D0",
  authDomain: "personal-calendar-d1824.firebaseapp.com",
  projectId: "personal-calendar-d1824",
  storageBucket: "personal-calendar-d1824.firebasestorage.app",
  messagingSenderId: "134561162973",
  appId: "1:134561162973:web:4640f2dfe15bc0eddc5d34",
  measurementId: "G-9VXKYZ4MTQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function ProductivityTracker() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [completedDays, setCompletedDays] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await loadUserData(user.uid);
        setView('calendar');
      } else {
        setUser(null);
        setView('login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTasks(data.tasks || []);
        setCompletedDays(data.completedDays || {});
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const saveUserData = async (uid, data) => {
    try {
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, data, { merge: true });
    } catch (err) {
      console.error('Error saving data:', err);
    }
  };

  const handleSignUp = async () => {
    setError('');
    setAuthLoading(true);
    
    if (tasks.length === 0) {
      setError('Please add at least one task before signing up');
      setAuthLoading(false);
      return;
    }

    if (!email || !password) {
      setError('Please fill in all fields');
      setAuthLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setAuthLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserData(userCredential.user.uid, { tasks, completedDays: {} });
      setEmail('');
      setPassword('');
      setTasks([]);
      setView('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    setAuthLoading(true);
    
    if (!email || !password) {
      setError('Please fill in all fields');
      setAuthLoading(false);
      return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
      // onAuthStateChanged will handle the redirect automatically
    } catch (err) {
      setError('Invalid email or password');
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTasks([]);
      setCompletedDays({});
      setNewTask('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const addTask = () => {
    if (newTask.trim()) {
      const updatedTasks = [...tasks, { id: Date.now().toString(), name: newTask.trim() }];
      setTasks(updatedTasks);
      setNewTask('');
      
      if (user) {
        saveUserData(user.uid, { tasks: updatedTasks });
      }
    }
  };

  const removeTask = (taskId) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    
    const updatedCompletedDays = { ...completedDays };
    Object.keys(updatedCompletedDays).forEach(date => {
      if (updatedCompletedDays[date][taskId]) {
        delete updatedCompletedDays[date][taskId];
      }
    });
    
    setCompletedDays(updatedCompletedDays);
    
    if (user) {
      saveUserData(user.uid, { tasks: updatedTasks, completedDays: updatedCompletedDays });
    }
  };

  const toggleTaskCompletion = (date, taskId) => {
    const dateKey = date.toDateString();
    const updated = { ...completedDays };
    
    if (!updated[dateKey]) {
      updated[dateKey] = {};
    }
    
    updated[dateKey][taskId] = !updated[dateKey][taskId];
    setCompletedDays(updated);
    
    if (user) {
      saveUserData(user.uid, { completedDays: updated });
    }
  };

  const isDateComplete = (date) => {
    const dateKey = date.toDateString();
    if (!completedDays[dateKey] || tasks.length === 0) return false;
    
    return tasks.every(task => completedDays[dateKey][task.id]);
  };

  const getTasksForDate = (date) => {
    const dateKey = date.toDateString();
    return tasks.map(task => ({
      ...task,
      completed: completedDays[dateKey]?.[task.id] || false
    }));
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  };

  const changeMonth = (offset) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl text-purple-600">Loading...</div>
      </div>
    );
  }

  if (view === 'login' || view === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <Calendar className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            {view === 'login' ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-center text-gray-600 mb-8">
            {view === 'login' ? 'Sign in to track your productivity' : 'Create your account and add your daily tasks'}
          </p>

          {view === 'signup' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Daily Tasks</label>
              <div className="space-y-2 mb-3">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                    <span className="text-gray-700">{task.name}</span>
                    <button
                      onClick={() => removeTask(task.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addTask)}
                  placeholder="Add a task (e.g., Go to gym)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={addTask}
                  className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, view === 'login' ? handleLogin : handleSignUp)}
                disabled={authLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, view === 'login' ? handleLogin : handleSignUp)}
                disabled={authLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                placeholder="••••••••"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={view === 'login' ? handleLogin : handleSignUp}
              disabled={authLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed"
            >
              {authLoading ? (view === 'login' ? 'Signing in...' : 'Signing up...') : (view === 'login' ? 'Sign In' : 'Sign Up')}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setView(view === 'login' ? 'signup' : 'login');
                setError('');
              }}
              disabled={authLoading}
              className="text-purple-600 hover:text-purple-700 font-medium disabled:text-purple-400"
            >
              {view === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Productivity Tracker</h1>
                <p className="text-gray-600 text-sm">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => changeMonth(-1)}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors font-semibold"
              >
                ←
              </button>
              <h2 className="text-xl font-bold text-gray-800">{monthYear}</h2>
              <button
                onClick={() => changeMonth(1)}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors font-semibold"
              >
                →
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const isComplete = isDateComplete(date);
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-lg scale-105'
                        : isComplete
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : isToday
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-semibold">{day}</span>
                    {isComplete && <CheckCircle2 className="w-4 h-4 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
            
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tasks yet. Add some tasks to get started!</p>
            ) : (
              <div className="space-y-3">
                {getTasksForDate(selectedDate).map(task => (
                  <button
                    key={task.id}
                    onClick={() => toggleTaskCompletion(selectedDate, task.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all ${
                      task.completed
                        ? 'bg-green-50 border-2 border-green-500'
                        : 'bg-gray-50 border-2 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={`text-left ${task.completed ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                      {task.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}