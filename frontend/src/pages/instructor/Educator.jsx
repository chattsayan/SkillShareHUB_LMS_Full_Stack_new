import { Outlet } from "react-router-dom";
import Navbar from "../../components/instructor/Navbar";
import Sidebar from "../../components/instructor/Sidebar";
import Footer from "../../components/instructor/Footer";

const Educator = () => {
  return (
    <div className="text-default min-h-screen bg-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Educator;
