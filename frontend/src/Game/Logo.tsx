// import logo from '../src/assets/tic-tac-lg.PNG';


function Logo() {
  return (
    <div className="flex items-center gap-3 px-6 py-5">
      {/* <img src={logo} alt="icon" className="w-8 h-8" /> */}
      <h1
        className="text-white text-xl  font-bold"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Tic-Tac-Toe
      </h1>
    </div>
  );
}

export default Logo;
