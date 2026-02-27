import { useState } from 'react'
import { Gamepad2, Trophy } from 'lucide-react'

const games = [
  { id: 'sprint', name: '单词跑酷', icon: '🏃', color: 'from-green-400 to-green-500', desc: '快速识别单词', locked: false },
  { id: 'target', name: '靶心挑战', icon: '🎯', color: 'from-red-400 to-red-500', desc: '听写拼读单词', locked: false },
  { id: 'match', name: '卡片配对', icon: '🎴', color: 'from-purple-400 to-purple-500', desc: '单词图片配对', locked: false },
  { id: 'quiz', name: '知识竞赛', icon: '🧠', color: 'from-blue-400 to-blue-500', desc: '趣味问答挑战', locked: true },
]

export default function Games() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">游戏中心</h2>
        <p className="text-gray-500 text-sm">玩着学英语</p>
      </div>

      <div className="card bg-gradient-to-r from-primary-500 to-secondary-400 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm">今日推荐</p>
            <h3 className="text-2xl font-bold mb-2">🎯 靶心挑战</h3>
            <p className="text-primary-100 text-sm">完成游戏获得 50 金币</p>
          </div>
          <button onClick={() => setSelectedGame('target')} className="px-6 py-3 bg-white text-primary-600 rounded-xl font-bold">
            开始
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {games.map(game => (
          <button key={game.id} onClick={() => !game.locked && setSelectedGame(game.id)} disabled={game.locked}
            className={`card relative overflow-hidden ${game.locked ? 'opacity-50' : 'hover:scale-[1.02] transition-transform'}`}>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl mb-3`}>
              {game.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{game.name}</h3>
            <p className="text-xs text-gray-500">{game.desc}</p>
            {game.locked && <span className="absolute top-2 right-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">即将上线</span>}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">排行榜</h3>
          <Trophy className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="space-y-3">
          {[{rank:1,name:'小明',score:1250,avatar:'👦'},{rank:2,name:'小红',score:1180,avatar:'👧'},{rank:3,name:'小刚',score:1050,avatar:'👦'}].map(user => (
            <div key={user.rank} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${user.rank===1?'bg-yellow-100 text-yellow-600':user.rank===2?'bg-gray-100 text-gray-600':'bg-orange-100 text-orange-600'}`}>{user.rank}</span>
              <span className="text-xl">{user.avatar}</span>
              <span className="flex-1 font-medium text-gray-900">{user.name}</span>
              <span className="text-sm text-gray-500">{user.score}分</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
