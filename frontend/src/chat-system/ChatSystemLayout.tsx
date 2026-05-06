import { Outlet } from "react-router-dom";
import Bar from "../components/Bar";
import BottomNav from "../components/BottomNav";

export  function ChatSystemLayout() {
    return (
        <div className="h-screen overflow-hidden bg-slate-900 flex flex-col pb-16">
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