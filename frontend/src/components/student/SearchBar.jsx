import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets.js";
import { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [input, setInput] = useState(onSearch ? onSearch : "");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/course-list/${input}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl w-full md:h-14 h-12 flex items-center bg-white border border-gray-500/20 rounded"
    >
      <img
        src={assets.search_icon}
        alt="search"
        className="md:w-auto w-10 px-3"
      />
      <input
        type="text"
        placeholder="e.g. React"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full h-full outline-none text-gray-500/80"
      />
      <button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 cursor-pointer rounded text-white md:px-10 px-7 md:py-3 py-2 mx-1"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
