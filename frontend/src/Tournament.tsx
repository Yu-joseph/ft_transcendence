import Bar from './components/Bar'
import BottomNav from './components/BottomNav'

function Tournament() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-blue-900 to-slate-950 flex flex-col">
      <Bar />
      <div>Join availibe tournament</div>
      <div>create tournament</div>
      <BottomNav />
    </div>
  )
}

export default Tournament