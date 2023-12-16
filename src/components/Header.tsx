const Header: React.FC = () => (
  <div className="flex items-center mb-8">
    <div className="fixed w-16 h-16">
      <div className="absolute left-0 top-0 bg-yellow-300 rounded-full w-32 h-32 transform translate-x-1/2 -translate-y-1/2"></div>
    </div>
    <h1 className="relative text-6xl pt-5 font-bold m-auto text-center">
      早起的黄金一小时
    </h1>
  </div>
);

export default Header;
