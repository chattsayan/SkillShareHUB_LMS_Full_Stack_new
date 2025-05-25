import { Link } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { useContext } from "react";
import { AppContext } from "../../utils/AppContext";

const Navbar = () => {
  const isCourseListPage = location.pathname.includes("/course-list");

  const { openSignIn } = useClerk();
  const { user } = useUser();
  const { navigate, isInstructor } = useContext(AppContext);

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
              <button
                onClick={() => {
                  navigate("/educator");
                }}
              >
                {isInstructor ? "Instructor Dashboard" : "Become Instructor"}
              </button>{" "}
              | <Link to="/my-learnings">My Learnings</Link>
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
              <button>
                {isInstructor ? "Instructor Dashboard" : "Become Instructor"}
              </button>{" "}
              | <Link to="/my-learnings">My Learnings</Link>
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
