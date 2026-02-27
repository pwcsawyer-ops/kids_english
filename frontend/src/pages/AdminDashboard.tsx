import { useState } from 'react'
import { Users, BookOpen, BarChart3, Settings, Plus, Search, Trash2 } from 'lucide-react'

const tabs = [
  { id: 'students', name: '学生管理', icon: Users },
  { id: 'words', name: '词库管理', icon: BookOpen },
  { id: 'stats', name: '数据统计', icon: BarChart3 },
  { id: 'settings', name: '系统设置', icon: Settings },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('students')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
        <p className="text-gray-500">管理系统用户和数据</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="card">
        {activeTab === 'students' && <StudentsPanel />}
        {activeTab === 'words' && <WordsPanel />}
        {activeTab === 'stats' && <StatsPanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  )
}

function StudentsPanel() {
  const students = [
    { id: 1, name: '小明', username: 'xiaoming', words: 150, accuracy: 85, streak: 5 },
    { id: 2, name: '小红', username: 'xiaohong', words: 120, accuracy: 78, streak: 3 },
    { id: 3, name: '小刚', username: 'xiaogang', words: 200, accuracy: 92, streak: 10 },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索学生..."
            className="input pl-10"
          />
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 添加学生
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-500">学生</th>
              <th className="text-left py-3 px-2 font-medium text-gray-500">词汇量</th>
              <th className="text-left py-3 px-2 font-medium text-gray-500">正确率</th>
              <th className="text-left py-3 px-2 font-medium text-gray-500">连续学习</th>
              <th className="text-left py-3 px-2 font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2">
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">@{student.username}</p>
                  </div>
                </td>
                <td className="py-3 px-2">{student.words}</td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    student.accuracy >= 80 ? 'bg-green-100 text-green-600' :
                    student.accuracy >= 60 ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {student.accuracy}%
                  </span>
                </td>
                <td className="py-3 px-2">{student.streak}天</td>
                <td className="py-3 px-2">
                  <button className="text-red-500 hover:bg-red-50 p-2 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function WordsPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-primary-500 text-white rounded-lg">全部</button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">KET</button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">PET</button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">剑桥少儿</button>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 添加词汇
        </button>
      </div>

      <div className="text-center py-8 text-gray-500">
        <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>词库管理功能</p>
      </div>
    </div>
  )
}

function StatsPanel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-primary-50">
          <p className="text-3xl font-bold text-primary-600">156</p>
          <p className="text-sm text-gray-600">总学生数</p>
        </div>
        <div className="card bg-green-50">
          <p className="text-3xl font-bold text-green-600">12,450</p>
          <p className="text-sm text-gray-600">总词汇量</p>
        </div>
        <div className="card bg-orange-50">
          <p className="text-3xl font-bold text-orange-600">85%</p>
          <p className="text-sm text-gray-600">平均正确率</p>
        </div>
        <div className="card bg-purple-50">
          <p className="text-3xl font-bold text-purple-600">1,234</p>
          <p className="text-sm text-gray-600">今日学习次数</p>
        </div>
      </div>

      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>数据统计图表开发中...</p>
      </div>
    </div>
  )
}

function SettingsPanel() {
  return (
    <div className="space-y-4">
      {[
        { label: '系统配置', desc: '基础系统设置' },
        { label: '词库导入', desc: '批量导入词汇' },
        { label: '用户权限', desc: '角色权限管理' },
        { label: '数据备份', desc: '导出/导入数据' },
      ].map((item, i) => (
        <button
          key={i}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100"
        >
          <div className="text-left">
            <p className="font-medium text-gray-900">{item.label}</p>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      ))}
    </div>
  )
}
