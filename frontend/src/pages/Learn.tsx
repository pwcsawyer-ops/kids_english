import { useState, useEffect } from 'react'
import { Volume2, Check, X, ChevronRight } from 'lucide-react'
import { learnApi } from '../services/api'
import toast from 'react-hot-toast'

interface Word {
  id: string
  word: string
  phonetic: string
  meaning: string
  example: string
  audioUrl?: string
}

export default function Learn() {
  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showMeaning, setShowMeaning] = useState(false)
  const [learningMode, setLearningMode] = useState<'new' | 'review'>('new')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWords()
  }, [learningMode])

  const loadWords = async () => {
    setLoading(true)
    try {
      const endpoint = learningMode === 'new' ? '/learn/today' : '/learn/review'
      const res = await learnApi.getTodayWords()
      setWords(res.data.words || [])
      setCurrentIndex(0)
      setShowMeaning(false)
    } catch (error) {
      console.error(error)
      toast.error('加载单词失败')
    } finally {
      setLoading(false)
    }
  }

  const playAudio = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const handleKnow = async () => {
    try {
      await learnApi.recordProgress({
        wordId: words[currentIndex].id,
        status: 'known'
      })
      nextWord()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDontKnow = async () => {
    try {
      await learnApi.recordProgress({
        wordId: words[currentIndex].id,
        status: 'unknown'
      })
      nextWord()
    } catch (error) {
      console.error(error)
    }
  }

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowMeaning(false)
    } else {
      toast.success('恭喜完成今日学习！')
      loadWords()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">太棒了！</h3>
        <p className="text-gray-500">今天的学习任务已完成</p>
      </div>
    )
  }

  const currentWord = words[currentIndex]

  return (
    <div className="space-y-6">
      {/* Mode Switch */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setLearningMode('new')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            learningMode === 'new' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          学习新词
        </button>
        <button
          onClick={() => setLearningMode('review')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            learningMode === 'review' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          复习旧词
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>第 {currentIndex + 1} / {words.length} 个</span>
        <span>{Math.round(((currentIndex) / words.length) * 100)}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary-500 rounded-full transition-all"
          style={{ width: `${((currentIndex) / words.length) * 100}%` }}
        />
      </div>

      {/* Word Card */}
      <div className="card text-center py-12">
        <button
          onClick={() => playAudio(currentWord.word)}
          className="mb-4 p-4 rounded-full bg-primary-50 hover:bg-primary-100 transition-colors inline-flex"
        >
          <Volume2 className="w-8 h-8 text-primary-500" />
        </button>
        
        <h2 className="text-4xl font-bold text-gray-900 mb-2">{currentWord.word}</h2>
        <p className="text-xl text-gray-500 mb-6">/{currentWord.phonetic}/</p>
        
        {showMeaning ? (
          <div className="animate-fade-in">
            <p className="text-2xl text-primary-600 font-semibold mb-4">{currentWord.meaning}</p>
            <p className="text-gray-600 italic mb-6">"{currentWord.example}"</p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDontKnow}
                className="px-6 py-3 bg-red-100 text-red-600 rounded-xl font-semibold flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                不认识
              </button>
              <button
                onClick={handleKnow}
                className="px-6 py-3 bg-green-100 text-green-600 rounded-xl font-semibold flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                认识了
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowMeaning(true)}
            className="btn-primary"
          >
            显示意思
          </button>
        )}
      </div>

      {/* Navigation */}
      <button
        onClick={nextWord}
        className="w-full py-3 bg-gray-100 rounded-xl text-gray-600 font-medium flex items-center justify-center gap-2"
      >
        下一个 <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
