import Companies from "../../components/student/Companies";
import CourseSection from "../../components/student/CourseSection";
import Footer from "../../components/student/Footer";
import Hero from "../../components/student/Hero";
import TestimonialSection from "../../components/student/TestimonialSection";

const Home = () => {
  return (
    <div className="flex flex-col items-center space-y-7 text-center">
      <Hero />
      <Companies />
      <CourseSection />
      <TestimonialSection />
      <Footer />
    </div>
  );
};

export default Home;
