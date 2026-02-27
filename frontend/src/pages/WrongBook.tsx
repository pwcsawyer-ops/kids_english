import { useState, useEffect } from 'react'
import { Trash2, Volume2 } from 'lucide-react'
import { wrongBookApi } from '../services/api'
import toast from 'react-hot-toast'

interface WrongWord {
  id: string
  word: string
  phonetic: string
  meaning: string
  wrongCount: number
  lastWrongAt: string
  category: 'spelling' | 'listening' | 'reading' | 'grammar'
}

const categoryMap = {
  spelling: { label: '拼写', color: 'bg-red-100 text-red-600' },
  listening: { label: '听力', color: 'bg-purple-100 text-purple-600' },
  reading: { label: '阅读', color: 'bg-blue-100 text-blue-600' },
  grammar: { label: '语法', color: 'bg-orange-100 text-orange-600' },
}

export default function WrongBook() {
  const [words, setWords] = useState<WrongWord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadWrongWords()
  }, [])

  const loadWrongWords = async () => {
    setLoading(true)
    try {
      const res = await wrongBookApi.list()
      setWords(res.data.words || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const playAudio = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    speechSynthesis.speak(utterance)
  }

  const handleRemove = async (id: string) => {
    try {
      await wrongBookApi.remove(id)
      setWords(words.filter(w => w.id !== id))
      toast.success('已移除')
    } catch (error) {
      console.error(error)
    }
  }

  const handleClearAll = async () => {
    if (!confirm('确定清空所有错题吗？')) return
    try {
      await wrongBookApi.clear()
      setWords([])
      toast.success('已清空')
    } catch (error) {
      console.error(error)
    }
  }

  const filteredWords = filter === 'all' 
    ? words 
    : words.filter(w => w.category === filter)

  const categories = ['all', 'spelling', 'listening', 'reading', 'grammar']

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">错题本</h2>
          <p className="text-sm text-gray-500">共 {words.length} 个错误</p>
        </div>
        {words.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-red-500 text-sm flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" /> 清空
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === cat
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {cat === 'all' ? '全部' : categoryMap[cat as keyof typeof categoryMap].label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-orange-50 border-orange-200">
          <p className="text-2xl font-bold text-orange-600">{words.length}</p>
          <p className="text-xs text-orange-600">总错题数</p>
        </div>
        <div className="card bg-green-50 border-green-200">
          <p className="text-2xl font-bold text-green-600">
            {words.filter(w => w.wrongCount >= 3).length}
          </p>
          <p className="text-xs text-green-600">严重薄弱</p>
        </div>
      </div>

      {/* Wrong Words List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">太棒了！</h3>
          <p className="text-gray-500">暂无错题</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWords.map(word => (
            <div key={word.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{word.word}</span>
                    <button 
                      onClick={() => playAudio(word.word)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <Volume2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <span className="text-gray-400 text-sm">/{word.phonetic}/</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{word.meaning}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${categoryMap[word.category].color}`}>
                      {categoryMap[word.category].label}
                    </span>
                    <span className="text-xs text-gray-400">
                      错误 {word.wrongCount} 次
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(word.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
