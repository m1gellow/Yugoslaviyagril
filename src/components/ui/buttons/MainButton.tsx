
interface MainButton{
    children: React.ReactNode;
    onClick?: () => void;
    type?: "submit" | 'button'
}

const MainButton = ({children, type="button"}: MainButton) => {
  return (
    <button type={type} className="px-6 lg:px-12 py-[7px] bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full text-sm">
      {children}
    </button>
  );
};

export default MainButton;
