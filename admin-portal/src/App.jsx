import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ManageExams from './pages/ManageExams';
import ScheduleExam from './pages/ScheduleExam';
import EditExam from './pages/EditExam';
import ActiveStudents from './pages/ActiveStudents';
import TestCreate from './pages/TestCreate';
import StorageMetrics from './pages/StorageMetrics';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Attendance from './pages/Attendance';
import Batches from './pages/Batches';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-off-white flex flex-col selection:bg-lime/30">
        <Helmet>
          <title>Admin - Manage Exams</title>
        </Helmet>

        <Navbar />
        <main className="flex-grow pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<ManageExams />} />
            <Route path="/create" element={<ScheduleExam />} />
            <Route path="/create-content" element={<TestCreate />} />
            <Route path="/edit/:id" element={<EditExam />} />
            <Route path="/active-students" element={<ActiveStudents />} />
            <Route path="/storage" element={<StorageMetrics />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/attendance" element={<Attendance />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
