import React, { useState, useEffect } from 'react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { Calendar, CheckCircle2, Circle, Plus, X, LogOut, Edit2, Trash2, Sparkles } from 'lucide-react';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDINs7flONNZyrjv5B-uHKVjx5lyLZV9D0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "personal-calendar-d1824.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "personal-calendar-d1824",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "personal-calendar-d1824.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "134561162973",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:134561162973:web:4640f2dfe15bc0eddc5d34",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9VXKYZ4MTQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Confetti Component
const Confetti = () => {
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 2 + Math.random() * 3,
      animationDelay: Math.random() * 0.5,
      backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'][Math.floor(Math.random() * 6)]
    }));
    setConfettiPieces(pieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map(piece => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            backgroundColor: piece.backgroundColor,
            animation: `confetti-fall ${piece.animationDuration}s linear ${piece.animationDelay}s forwards`
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Success Modal Component
const SuccessModal = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <Confetti />
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform animate-bounce-in">
        <div className="mb-4 flex justify-center">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-2">You Made It! 🎉</h2>
        <p className="text-lg text-gray-600 mb-4">All tasks completed for today!</p>
        <p className="text-sm text-gray-500">Keep up the amazing work!</p>
      </div>
      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
};

// Rest Day Modal Component
const RestDayModal = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform animate-bounce-in">
        <div className="mb-4 flex justify-center">
          <div className="text-6xl">😌</div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">That's Fine!</h2>
        <p className="text-lg text-gray-600 mb-2">Body also needs rest</p>
        <p className="text-md text-purple-600 font-semibold">Come back tomorrow 💪</p>
      </div>
      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
};

// Delete Account Confirmation Modal
const DeleteAccountModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="mb-4 flex justify-center">
          <div className="text-6xl">⚠️</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Delete Account?</h2>
        <p className="text-gray-600 mb-6 text-center">
          This action cannot be undone. All your tasks, progress, and data will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

// Task Management Modal Component
const TaskManagementModal = ({ tasks, onClose, onAddTask, onRemoveTask }) => {
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask(newTask.trim());
      setNewTask('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Manage Tasks</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add New Task</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Enter task name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleAddTask}
              className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Tasks</label>
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tasks yet. Add your first task!</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                  <span className="text-gray-700">{task.name}</span>
                  <button
                    onClick={() => onRemoveTask(task.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// Motivational Quote Component
const MotivationalQuote = () => {
  const [quote, setQuote] = useState({ text: 'Loading inspiration...', author: '' });
  const [loading, setLoading] = useState(true);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      // Using ZenQuotes API with cache-busting parameter
      const response = await fetch(`https://zenquotes.io/api/random?_=${Date.now()}`);
      const data = await response.json();
      
      if (data && data[0]) {
        setQuote({ text: data[0].q, author: data[0].a });
        console.log('Quote updated:', data[0].q);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quote:', error);
      // Fallback quotes array
      const fallbackQuotes = [
        { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
        { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
        { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
        { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
        { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
        { text: 'Everything you\'ve ever wanted is on the other side of fear.', author: 'George Addair' },
        { text: 'Success is not how high you have climbed, but how you make a positive difference to the world.', author: 'Roy T. Bennett' },
        { text: 'Don\'t watch the clock; do what it does. Keep going.', author: 'Sam Levenson' }
      ];
      const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      setQuote(randomQuote);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
    const interval = setInterval(() => {
      console.log('Fetching new quote...');
      fetchQuote();
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-lg p-6 mb-6 text-white">
      <div className="flex items-start gap-3">
        <Sparkles className="w-6 h-6 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <p className="text-lg font-medium mb-2 italic">
            {loading ? 'Loading inspiration...' : `"${quote.text}"`}
          </p>
          {!loading && quote.author && (
            <p className="text-sm text-purple-100">— {quote.author}</p>
          )}
        </div>
      </div>
    </div>
  );
};

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRestDayModal, setShowRestDayModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [restDays, setRestDays] = useState({});

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
        setRestDays(data.restDays || {});
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
      setRestDays({});
      setNewTask('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      // Delete user data from Firestore
      const docRef = doc(db, 'users', user.uid);
      await deleteDoc(docRef);
      
      // Delete user authentication account
      await deleteUser(user);
      
      // Clear local state
      setTasks([]);
      setCompletedDays({});
      setRestDays({});
      setNewTask('');
      setShowDeleteConfirm(false);
      
      // User will be automatically logged out and redirected to login
    } catch (err) {
      console.error('Delete account error:', err);
      alert('Error deleting account. You may need to log in again and try once more.');
    }
  };

  const addTask = (taskName) => {
    const updatedTasks = [...tasks, { id: Date.now().toString(), name: taskName }];
    setTasks(updatedTasks);
    
    if (user) {
      saveUserData(user.uid, { tasks: updatedTasks });
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
    
    const wasCompleted = updated[dateKey][taskId];
    updated[dateKey][taskId] = !wasCompleted;
    setCompletedDays(updated);
    
    if (user) {
      saveUserData(user.uid, { completedDays: updated });
    }

    // Check if all tasks are now completed
    const allCompleted = tasks.every(task => updated[dateKey][task.id]);
    if (allCompleted && tasks.length > 0 && !wasCompleted) {
      setShowSuccessModal(true);
    }
  };

  const markAsRestDay = (date) => {
    const dateKey = date.toDateString();
    const updated = { ...restDays };
    updated[dateKey] = true;
    setRestDays(updated);
    setShowRestDayModal(true);
    
    if (user) {
      saveUserData(user.uid, { restDays: updated });
    }
  };

  const undoRestDay = (date) => {
    const dateKey = date.toDateString();
    const updated = { ...restDays };
    delete updated[dateKey];
    setRestDays(updated);
    
    if (user) {
      saveUserData(user.uid, { restDays: updated });
    }
  };

  const isRestDay = (date) => {
    const dateKey = date.toDateString();
    return restDays[dateKey] === true;
  };

  const getDateCompletionStatus = (date) => {
    const dateKey = date.toDateString();
    
    // Check if it's a rest day first
    if (restDays[dateKey]) {
      return { percentage: 0, color: 'rest', isRestDay: true };
    }
    
    if (!completedDays[dateKey] || tasks.length === 0) return { percentage: 0, color: null, isRestDay: false };
    
    const completedCount = tasks.filter(task => completedDays[dateKey][task.id]).length;
    const percentage = (completedCount / tasks.length) * 100;
    
    let color = null;
    if (percentage >= 80) {
      color = 'green';
    } else if (percentage >= 60) {
      color = 'yellow';
    } else if (percentage >= 40) {
      color = 'orange';
    } else if (percentage >= 20) {
      color = 'red';
    }
    
    return { percentage, color, completedCount, totalCount: tasks.length, isRestDay: false };
  };

  const isDateComplete = (date) => {
    const { percentage } = getDateCompletionStatus(date);
    return percentage === 100;
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

  const calculateStreak = () => {
    if (tasks.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if today is complete or a rest day
    const todayKey = today.toDateString();
    let todayComplete = false;
    
    if (restDays[todayKey]) {
      todayComplete = true;
    } else if (completedDays[todayKey]) {
      todayComplete = tasks.every(task => completedDays[todayKey][task.id]);
    }
    
    // If today is complete, start counting from today
    // If today is not complete, start counting from yesterday
    const startDay = todayComplete ? 0 : 1;
    
    // Start from the appropriate day and go backwards
    for (let i = startDay; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateKey = checkDate.toDateString();
      
      // Check if it's a rest day
      if (restDays[dateKey]) {
        streak++;
        continue;
      }
      
      // Check if all tasks are completed
      if (completedDays[dateKey]) {
        const allCompleted = tasks.every(task => completedDays[dateKey][task.id]);
        if (allCompleted) {
          streak++;
        } else {
          // Incomplete day breaks the streak
          break;
        }
      } else {
        // No data for this day breaks the streak
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();

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
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newTask.trim()) {
                      addTask(newTask.trim());
                      setNewTask('');
                    }
                  }}
                  placeholder="Add a task (e.g., Go to gym)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => {
                    if (newTask.trim()) {
                      addTask(newTask.trim());
                      setNewTask('');
                    }
                  }}
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
      {showSuccessModal && <SuccessModal onClose={() => setShowSuccessModal(false)} />}
      {showRestDayModal && <RestDayModal onClose={() => setShowRestDayModal(false)} />}
      {showDeleteConfirm && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
      {showTaskModal && (
        <TaskManagementModal
          tasks={tasks}
          onClose={() => setShowTaskModal(false)}
          onAddTask={addTask}
          onRemoveTask={removeTask}
        />
      )}

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
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg font-bold"
                title="Your Total Streak"
              >
                <span className="text-lg">{currentStreak}</span>
                <span className="text-xl">🔥</span>
              </div>
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span className="hidden sm:inline">Manage Tasks</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <MotivationalQuote />

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
                const { color, percentage, completedCount, totalCount, isRestDay } = getDateCompletionStatus(date);
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());

                let bgColor = 'bg-gray-50 hover:bg-gray-100';
                let textColor = 'text-gray-800';
                let checkColor = 'text-gray-600';

                if (isSelected) {
                  bgColor = 'bg-purple-600 shadow-lg scale-105';
                  textColor = 'text-white';
                  checkColor = 'text-white';
                } else if (isRestDay) {
                  bgColor = 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-300';
                  textColor = 'text-blue-700';
                } else if (color === 'green') {
                  bgColor = 'bg-green-100 hover:bg-green-200';
                  textColor = 'text-green-800';
                  checkColor = 'text-green-600';
                } else if (color === 'yellow') {
                  bgColor = 'bg-yellow-100 hover:bg-yellow-200';
                  textColor = 'text-yellow-800';
                  checkColor = 'text-yellow-600';
                } else if (color === 'orange') {
                  bgColor = 'bg-orange-100 hover:bg-orange-200';
                  textColor = 'text-orange-800';
                  checkColor = 'text-orange-600';
                } else if (color === 'red') {
                  bgColor = 'bg-red-100 hover:bg-red-200';
                  textColor = 'text-red-800';
                  checkColor = 'text-red-600';
                } else if (isToday) {
                  bgColor = 'bg-blue-100 hover:bg-blue-200';
                  textColor = 'text-blue-800';
                }

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${bgColor} ${textColor}`}
                    title={isRestDay ? 'Rest Day 😌' : (color ? `${completedCount}/${totalCount} tasks (${Math.round(percentage)}%)` : '')}
                  >
                    <span className="font-semibold">{day}</span>
                    {isRestDay ? (
                      <div className="text-lg mt-1">😌</div>
                    ) : color ? (
                      <div className="flex items-center mt-1">
                        {percentage === 100 ? (
                          <CheckCircle2 className={`w-4 h-4 ${checkColor}`} />
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            color === 'green' ? 'bg-green-600' :
                            color === 'yellow' ? 'bg-yellow-600' :
                            color === 'orange' ? 'bg-orange-600' :
                            'bg-red-600'
                          }`} />
                        )}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
            
            {isRestDay(selectedDate) ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">😌</div>
                <p className="text-blue-700 font-semibold text-lg mb-2">Rest Day</p>
                <p className="text-gray-500 text-sm mb-6">Taking a break today!</p>
                <button
                  onClick={() => undoRestDay(selectedDate)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Undo Rest Day
                </button>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No tasks yet!</p>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Add your first task
                </button>
              </div>
            ) : (
              <>
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
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => markAsRestDay(selectedDate)}
                    className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors border-2 border-blue-200 hover:border-blue-300"
                  >
                    😌 Rest Day
                    <span className="block text-xs text-blue-600 mt-1">(Use as less as you can)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-red-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-red-800 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-600 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}