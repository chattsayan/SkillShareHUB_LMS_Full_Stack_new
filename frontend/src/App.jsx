import { Route, Routes } from "react-router-dom";
import { useMatch } from "react-router-dom";
import "./App.css";
import Home from "./pages/student/Home";
import CoursesList from "./pages/student/CoursesList";
import CourseDetails from "./pages/student/CourseDetails";
import MyLearnings from "./pages/student/MyLearnings";
import Player from "./pages/student/Player";
import Loading from "./components/student/Loading";
import Educator from "./pages/instructor/Educator";
import Dashboard from "./pages/instructor/Dashboard";
import AddCourse from "./pages/instructor/AddCourse";
import MyCourses from "./pages/instructor/MyCourses";
import StudentsEnrolled from "./pages/instructor/StudentsEnrolled";
import Navbar from "./components/student/Navbar";
import Hero from "./components/student/Hero";
import "quill/dist/quill.core.css";
import { ToastContainer } from "react-toastify";

function App() {
  const isInstructorPage = useMatch("/educator/*");
  const isAdminPage = useMatch("/admin/*");

  return (
    <div className="text-default min-h-screen bg-white">
      <ToastContainer />
      {!isInstructorPage && !isAdminPage && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course-list/:input" element={<CoursesList />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/my-enrollments" element={<MyLearnings />} />
        <Route path="/player/:courseId" element={<Player />} />
        <Route path="/loading/:path" element={<Loading />} />

        <Route path="/educator" element={<Educator />}>
          {/* <Route index element={<Dashboard />} /> */}
          <Route path="/educator" element={<Dashboard />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="student-enrolled" element={<StudentsEnrolled />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
