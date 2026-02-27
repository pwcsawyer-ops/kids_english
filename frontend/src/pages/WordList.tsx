import { useState, useEffect } from 'react'
import { Search, Download, Upload } from 'lucide-react'
import { wordApi } from '../services/api'

interface Word {
  id: string
  word: string
  phonetic: string
  meaning: string
  level: string
  category: string
  mastered: boolean
}

const levels = ['全部', 'KET', 'PET', 'Starters', 'Movers', 'Flyers', '小学1-3年级', '小学4-6年级']

export default function WordList() {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('全部')

  useEffect(() => {
    loadWords()
  }, [levelFilter])

  const loadWords = async () => {
    setLoading(true)
    try {
      const params = levelFilter !== '全部' ? { level: levelFilter } : {}
      const res = await wordApi.list(params)
      setWords(res.data.words || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = () => {
    alert('导入功能开发中...')
  }

  const handleExport = () => {
    alert('导出功能开发中...')
  }

  const filteredWords = words.filter(w => 
    w.word.toLowerCase().includes(search.toLowerCase()) ||
    w.meaning.includes(search)
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={handleImport} className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-xl font-medium flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" /> 导入
        </button>
        <button onClick={handleExport} className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> 导出
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="搜索单词..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {levels.map(level => (
          <button key={level} onClick={() => setLevelFilter(level)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${levelFilter === level ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {level}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-500">{words.length}</p>
          <p className="text-xs text-gray-500">总词汇</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-500">{words.filter(w => w.mastered).length}</p>
          <p className="text-xs text-gray-500">已掌握</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-orange-500">{words.filter(w => !w.mastered).length}</p>
          <p className="text-xs text-gray-500">待学习</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filteredWords.map(word => (
            <div key={word.id} className="card flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{word.word}</span>
                  <span className="text-gray-400 text-sm">/{word.phonetic}/</span>
                  {word.mastered && <span className="text-green-500">✓</span>}
                </div>
                <p className="text-gray-600 text-sm">{word.meaning}</p>
              </div>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">{word.level}</span>
            </div>
          ))}
          {filteredWords.length === 0 && <div className="text-center py-8 text-gray-400">没有找到匹配的单词</div>}
        </div>
      )}
    </div>
  )
}
