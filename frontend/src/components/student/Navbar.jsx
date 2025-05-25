import { Link } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { useContext } from "react";
import { AppContext } from "../../utils/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const isCourseListPage = location.pathname.includes("/course-list");

  const { openSignIn } = useClerk();
  const { user } = useUser();
  const { navigate, isEducator, backendURL, setIsEducator, getToken } =
    useContext(AppContext);

  const becomeEducator = async () => {
    try {
      if (isEducator) {
        navigate("/educator");
        return;
      }

      const token = await getToken();
      const { data } = await axios.get(
        `${backendURL}/api/educator/update-role`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setIsEducator(true);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error while setting role:", error || error.message);
      toast.error(error.message);
    }
  };

  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${
        isCourseListPage ? "bg-white" : "bg-yellow-100/70"
      }`}
    >
      <img
        onClick={() => navigate("/")}
        src="/text-logo.png"
        alt="logo"
        className="w-28 lg:w-32 cursor-pointer"
      />
      <div className="hidden md:flex items-center gap-5 text-gray-500">
        <div className="flex items-center gap-5">
          {user && (
            <>
              <button onClick={() => becomeEducator()}>
                {isEducator ? "Educator Dashboard" : "Become Educator"}
              </button>{" "}
              | <Link to="/my-enrollments">My Learnings</Link>
            </>
          )}
        </div>

        {user ? (
          <UserButton />
        ) : (
          <button
            onClick={() => openSignIn()}
            className="bg-orange-500 text-white px-5 py-2 rounded-full cursor-pointer hover:bg-orange-600 transition-all duration-200"
          >
            Create Account
          </button>
        )}
      </div>

      {/* For Mobile Screen*/}
      <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
        <div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs">
          {user && (
            <>
              <button onClick={() => becomeEducator()}>
                {isEducator ? "Educator Dashboard" : "Become Educator"}
              </button>{" "}
              | <Link to="/my-enrollments">My Learnings</Link>
            </>
          )}
        </div>
        {user ? (
          <UserButton />
        ) : (
          <button onClick={() => openSignIn()} className="cursor-pointer">
            <img
              src="https://www.svgrepo.com/show/13656/user.svg"
              alt=""
              className="w-9 h-9"
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
