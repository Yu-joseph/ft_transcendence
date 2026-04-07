import { Outlet } from "react-router-dom";
import Bar from "../components/Bar";
import BottomNav from "../components/BottomNav";

export  function ChatSystemLayout() {
    return (
        <div className="h-screen overflow-hidden bg-linear-to-b from-slate-900 via-blue-900 to-slate-950 flex flex-col pb-16">
        <Bar/>
        <main className="flex-1 overflow-hidden">
            <div className="h-full">
                <Outlet/>
            </div>
        </main>
        <BottomNav />
      </div>
    );
}