import Course from "../models/Course.js";

export const getAllCourse = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .select(["-courseContent", "-enrolledStudents"])
      .populate({ path: "educator" });

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch courses",
    });
  }
};

// get course by id
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const courseData = await Course.findById(id).populate({ path: "educator" });

    //   remove lectures if ispreviewFree is false
    courseData.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (!lecture.isPreviewFree) {
          lecture.lectureUrl = "";
        }
      });
    });

    res.status(200).json({
      success: true,
      course: courseData,
    });
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch course by ID",
    });
  }
};
