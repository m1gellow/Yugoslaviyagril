
interface MainButton{
    text: string;
    onClick?: () => void;
}

const MainButton = ({ text}: MainButton) => {
  return (
    <button  className="px-6 lg:px-12 py-[7px] bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full text-sm">
      {text}
    </button>
  );
};

export default MainButton;
