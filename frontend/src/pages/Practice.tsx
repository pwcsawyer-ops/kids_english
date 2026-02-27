import { Pencil, Volume2, FileText } from 'lucide-react'

const practiceTypes = [
  { id: 'dictation', name: '单词默写', icon: Pencil, color: 'bg-blue-500', desc: '听写单词拼写' },
  { id: 'listening', name: '听力选择', icon: Volume2, color: 'bg-purple-500', desc: '听发音选中文' },
  { id: 'reading', name: '阅读理解', icon: FileText, color: 'bg-green-500', desc: '短文阅读练习' },
  { id: 'speaking', name: '口语跟读', icon: Volume2, color: 'bg-orange-500', desc: '跟读句子发音' },
]

export default function Practice() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">选择练习类型</h2>
        <p className="text-gray-500 text-sm">全面提升听说读写能力</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {practiceTypes.map(type => {
          const Icon = type.icon
          return (
            <button key={type.id} className="card hover:scale-[1.02] transition-transform text-left">
              <div className={`w-12 h-12 rounded-xl ${type.color} flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{type.name}</h3>
              <p className="text-xs text-gray-500">{type.desc}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
