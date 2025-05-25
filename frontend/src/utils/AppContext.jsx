import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);

  const currency = import.meta.env.VITE_CURRENCY;
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const { getToken } = useAuth();
  const { user } = useUser();

  // Fetch all courses
  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/course/all`);
      if (data.success) {
        setAllCourses(data.courses);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching all courses:", error || error.message);
      toast.error("Failed to fetch all courses");
    }
  };

  // Fetch User Data
  const fetchUserData = async () => {
    if (user.publicMetadata.role === "educator") {
      setIsEducator(true);
    }

    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendURL}/api/user/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setUserData(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error || error.message);
      toast.error("Failed to fetch user data");
    }
  };

  // function to calculate avg rating of course
  const calculateAvgRating = (course) => {
    if (!course?.courseRatings || course.courseRatings.length === 0) return 0;

    let totalRating = 0;
    course.courseRatings.forEach((rating) => {
      totalRating += rating.rating;
    });

    return Math.floor(totalRating / course.courseRatings.length);
  };

  // function to calculate course chapter time
  const calculateChapterTime = (chapter) => {
    let totalTime = 0;
    chapter.chapterContent.map(
      (lecture) => (totalTime += lecture.lectureDuration)
    );
    return humanizeDuration(totalTime * 60 * 1000, { units: ["h", "m"] });
  };

  // function to calculate course duration
  const calculateCourseDuration = (course) => {
    let totalTime = 0;
    course.courseContent.map((chapter) =>
      chapter.chapterContent.map(
        (lecture) => (totalTime += lecture.lectureDuration)
      )
    );
    return humanizeDuration(totalTime * 60 * 1000, { units: ["h", "m"] });
  };

  // function to calculate no of lectures in course
  const calculateNoOfLectures = (course) => {
    let totalLectures = 0;
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures;
  };

  // fetch user enrolled courses
  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendURL}/api/user/enrolled-courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setEnrolledCourses(data.enrolledCourses.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(
        "Error fetching enrolled course data:",
        error || error.message
      );
      toast.error("Failed to fetch enrolled course data");
    }
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserEnrolledCourses();
    }
  }, [user]);

  const value = {
    currency,
    allCourses,
    navigate,
    calculateAvgRating,
    isEducator,
    setIsEducator,
    calculateNoOfLectures,
    calculateChapterTime,
    calculateCourseDuration,
    enrolledCourses,
    fetchUserEnrolledCourses,
    backendURL,
    userData,
    setUserData,
    getToken,
    fetchAllCourses,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
